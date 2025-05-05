const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

let token;
let projectId;
let clientId;

beforeAll(async () => {
  // Conexión explícita a MongoDB
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost/testdb');

  // Crear usuario
  const res = await request(app)
    .post('/api/user/register')
    .send({ email: 'proj@test.com', password: 'proj1234' });

  await request(app)
    .put('/api/user/validation')
    .send({ email: 'proj@test.com', code: res.body.verificationCode });

  const login = await request(app)
    .post('/api/user/login')
    .send({ email: 'proj@test.com', password: 'proj1234' });

  token = login.body.token;

  // Crear cliente necesario para el proyecto
  const clientRes = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Cliente Proyecto',
      email: 'cliente@proyecto.com',
      phone: '600112233',
      address: 'Dirección Proyecto'
    });

  clientId = clientRes.body._id;
}, 20000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Proyectos', () => {
  it('debería crear un nuevo proyecto', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Beta',
        description: 'Descripción de prueba',
        client: clientId
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('name', 'Proyecto Beta');
    projectId = res.body._id;
  });

  it('debería obtener todos los proyectos del usuario', async () => {
    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('name');
  });

  it('debería obtener un proyecto por su ID', async () => {
    const res = await request(app)
      .get(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', projectId);
  });

  it('debería archivar (soft delete) un proyecto', async () => {
    const res = await request(app)
      .patch(`/api/project/archive/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Proyecto archivado');
    expect(res.body.project).toHaveProperty('archived', true);
  });

  it('debería restaurar un proyecto archivado', async () => {
    const res = await request(app)
      .patch(`/api/project/restore/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Proyecto restaurado');
    expect(res.body.project).toHaveProperty('archived', false);
  });

  it('debería eliminar un proyecto definitivamente', async () => {
    const res = await request(app)
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Proyecto eliminado definitivamente');
  });
});