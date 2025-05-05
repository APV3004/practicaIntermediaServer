// tests/project.test.js
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

let token;
let clientId;
let projectId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost/testdb');

  // Registrar usuario
  const res = await request(app).post('/api/user/register').send({
    email: 'proyecto@example.com',
    password: 'test1234'
  });

  await request(app).put('/api/user/validation').send({
    email: 'proyecto@example.com',
    code: res.body.verificationCode
  });

  // Login
  let login = await request(app).post('/api/user/login').send({
    email: 'proyecto@example.com',
    password: 'test1234'
  });

  token = login.body.token;

  // Guardar datos de empresa
  await request(app)
    .patch('/api/user/company')
    .set('Authorization', `Bearer ${token}`)
    .send({
      company: {
        companyName: 'Empresa Test',
        companyCif: 'B87654321',
        companyAddress: 'Calle Test 123',
        companyStreet: 'Calle Test',
        companyNumber: '123',
        companyPostal: '28080',
        companyCity: 'Madrid',
        companyProvince: 'Madrid',
        isAutonomous: false
      }
    });

  // Re-login para actualizar token con empresa
  login = await request(app).post('/api/user/login').send({
    email: 'proyecto@example.com',
    password: 'test1234'
  });

  token = login.body.token;

  // Crear cliente
  const clientRes = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Cliente Proyecto',
      cif: 'B12345678'
    });

  clientId = clientRes.body._id;
});

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
        name: 'Proyecto Test',
        client: clientId,
        description: 'Descripción de prueba',
        startDate: '2025-01-01'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name', 'Proyecto Test');
    projectId = res.body._id;
  });

  it('debería obtener todos los proyectos del usuario', async () => {
    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
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
    expect(res.body).toHaveProperty('message');
  });

  it('debería eliminar un proyecto definitivamente', async () => {
    const res = await request(app)
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});

describe('Errores comunes de proyectos', () => {
  it('no debería crear un proyecto sin nombre', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({ client: clientId });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0]).toHaveProperty('msg', 'El nombre del proyecto es obligatorio');
  });

  it('no debería crear un proyecto duplicado', async () => {
    await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Duplicado',
        client: clientId,
        description: 'Proyecto duplicado',
        startDate: '2025-01-01'
      });

    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Duplicado',
        client: clientId
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Ya existe un proyecto con ese nombre.');
  });

  it('no debería acceder sin token', async () => {
    const res = await request(app).get('/api/project');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Acceso denegado. No se encontró el token.');
  });

  it('no debería acceder con token inválido', async () => {
    const res = await request(app)
      .get('/api/project')
      .set('Authorization', 'Bearer token_invalido');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Token no válido');
  });

  it('no debería archivar un proyecto inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/project/archive/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Proyecto no encontrado o no autorizado');
  });

  it('no debería restaurar un proyecto inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/project/restore/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Proyecto no encontrado o no autorizado');
  });

  it('no debería eliminar un proyecto inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/project/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Proyecto no encontrado');
  });
  
});