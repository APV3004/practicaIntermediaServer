const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const path = require('path');

let token, clientId, projectId, deliveryNoteId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost/testdb');

  // Registro de usuario
  const res = await request(app)
    .post('/api/user/register')
    .send({ email: 'albaran@test.com', password: 'test1234' });

  await request(app)
    .put('/api/user/validation')
    .send({ email: 'albaran@test.com', code: res.body.verificationCode });

  const login = await request(app)
    .post('/api/user/login')
    .send({ email: 'albaran@test.com', password: 'test1234' });

  token = login.body.token;

  // Crear cliente
  const clientRes = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Cliente Albaran',
      email: 'cliente@albaran.com',
      phone: '611223344',
      address: 'Calle Cliente 456',
      contactPerson: 'Laura Cliente'
    });

  clientId = clientRes.body._id;

  // Crear proyecto
  const projectRes = await request(app)
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Proyecto Albaran',
      description: 'Proyecto para pruebas de albaranes',
      client: clientId
    });

  projectId = projectRes.body._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Albaranes', () => {
  it('debería crear un albarán simple', async () => {
    const res = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        project: projectId,
        client: clientId,
        type: 'simple',
        data: [
          { name: 'Servicio X', quantity: 3 }
        ]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('project', projectId);
    expect(res.body).toHaveProperty('type', 'simple');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('name', 'Servicio X');

    deliveryNoteId = res.body._id;
  });

  it('debería obtener todos los albaranes del usuario', async () => {
    const res = await request(app)
      .get('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debería obtener un albarán por su ID', async () => {
    const res = await request(app)
      .get(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', deliveryNoteId);
    expect(res.body).toHaveProperty('type');
    expect(res.body).toHaveProperty('client');
  });

  it('debería eliminar un albarán no firmado', async () => {
    const res = await request(app)
      .delete(`/api/deliverynote/${deliveryNoteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Albarán eliminado correctamente');
  });

  it('debería firmar un nuevo albarán', async () => {
    const note = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        project: projectId,
        client: clientId,
        type: 'simple',
        data: [{ name: 'Tarea a firmar', quantity: 1 }]
      });

    const resSign = await request(app)
      .post(`/api/deliverynote/sign/${note.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', '__tests__/signature.png');

    expect(resSign.statusCode).toBe(200);
    expect(resSign.body).toHaveProperty('message', 'Albarán firmado correctamente');
    expect(resSign.body.note).toHaveProperty('signed', true);
  }, 10000); // timeout extendido

  it('no debería eliminar un albarán ya firmado', async () => {
    const signedNote = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        project: projectId,
        client: clientId,
        type: 'simple',
        data: [{ name: 'Albarán firmado', quantity: 1 }]
      });

    await request(app)
      .post(`/api/deliverynote/sign/${signedNote.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', '__tests__/signature.png');

    const res = await request(app)
      .delete(`/api/deliverynote/${signedNote.body._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'No se puede eliminar un albarán ya firmado');
  }, 10000); // timeout extendido

  it('debería descargar el PDF del albarán firmado', async () => {
    // Primero creamos un nuevo albarán
    const noteRes = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        project: projectId,
        client: clientId,
        type: 'simple',
        data: [{ name: 'Servicio Y', quantity: 1 }]
      });

    const noteId = noteRes.body._id;

    // Luego lo firmamos
    const signRes = await request(app)
      .post(`/api/deliverynote/sign/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('signature', '__tests__/signature.png');

    expect(signRes.statusCode).toBe(200);
    expect(signRes.body.note).toHaveProperty('pdfUrl');

    // Finalmente hacemos la petición GET para obtener el PDF
    const pdfRes = await request(app)
      .get(`/api/deliverynote/pdf/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    // Debería redirigir (status 302) a IPFS
    expect(pdfRes.statusCode).toBe(302);
    expect(pdfRes.headers.location).toContain('https://gateway.pinata.cloud/ipfs/');
  });

  
});