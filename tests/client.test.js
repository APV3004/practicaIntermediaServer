const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

let token;
let clientId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost/testdb');

  const res = await request(app)
    .post('/api/user/register')
    .send({ email: 'client111@test.com', password: 'client1234' });

  await request(app)
    .put('/api/user/validation')
    .send({ email: 'client111@test.com', code: res.body.verificationCode });

  const login = await request(app)
    .post('/api/user/login')
    .send({ email: 'client111@test.com', password: 'client1234' });

  token = login.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Clientes', () => {
  it('debería crear un nuevo cliente', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Empresa Demo2',
        email: 'demo@empresa.com',
        phone: '699312233',
        address: 'Calle Prueba 123',
        contactPerson: 'Juan Pérez'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Empresa Demo2');

    clientId = res.body._id;
  });

  it('debería obtener todos los clientes del usuario', async () => {
    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
  });

  it('debería obtener un cliente por su ID', async () => {
    const res = await request(app)
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', clientId);
    expect(res.body).toHaveProperty('name', 'Empresa Demo2');
  });
  
  it('debería actualizar un cliente existente', async () => {
    const res = await request(app)
      .put(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Empresa Demo2',
        email: 'demo@empresa.com',
        phone: '644556677',
        address: 'Calle Prueba 123',
        contactPerson: 'Juan Pérez'
      });
  
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('phone', '644556677');
  });

  it('debería restaurar un cliente archivado', async () => {
    await request(app)
      .patch(`/api/client/archive/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/client/restore/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Cliente restaurado');
    expect(res.body.client).toHaveProperty('archived', false);
  });

  it('debería eliminar un cliente definitivamente', async () => {
    const res = await request(app)
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Cliente eliminado definitivamente');
  });
});