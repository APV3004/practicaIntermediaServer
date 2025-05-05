const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

let verificationCode;
let token;
const email = 'test@example.com';
const password = 'test1234';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost/testdb');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Usuarios', () => {
  it('debería registrar un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email, password });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('verificationCode');

    verificationCode = res.body.verificationCode;
  });

  it('debería verificar el código de verificación', async () => {
    const res = await request(app)
      .put('/api/user/validation')
      .send({ email, code: verificationCode });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Usuario verificado correctamente');
  });

  it('debería iniciar sesión correctamente', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ email, password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('email', email);

    token = res.body.token;
  });

  it('debería completar el onboarding con datos personales', async () => {
    const res = await request(app)
      .put('/api/user/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Adrián',
        lastName: 'Pérez',
        nif: '12345678A'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Datos actualizados correctamente');
  });

  it('debería guardar los datos de la empresa', async () => {
    const res = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: {
          companyName: 'Empresa de Prueba',
          companyCif: 'B12345678',
          companyAddress: 'Calle Falsa 123',
          companyStreet: 'Calle Falsa',
          companyNumber: '123',
          companyPostal: '28080',
          companyCity: 'Madri',
          companyProvince: 'Madrid',
          isAutonomous: false
        }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Datos de la compañía actualizados correctamente');
  });

  it('debería obtener el perfil del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', email);
    expect(res.body).toHaveProperty('firstName', 'Adrián');
    expect(res.body).toHaveProperty('lastName', 'Pérez');
  });

  it('debería eliminar (archivar) al usuario autenticado', async () => {
    const res = await request(app)
      .delete('/api/user/delete')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Usuario desactivado');
  });
});

describe('Recuperación de contraseña (usuario independiente)', () => {
  const recoveryEmail = 'recover@example.com';
  const recoveryPassword = 'temporal1234';
  const newRecoveryPassword = 'nuevo9876';
  let recoveryCode;

  it('debería registrar y verificar el usuario de recuperación', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: recoveryEmail, password: recoveryPassword });

    expect(res.statusCode).toBe(201);

    const verify = await request(app)
      .put('/api/user/validation')
      .send({ email: recoveryEmail, code: res.body.verificationCode });

    expect(verify.statusCode).toBe(200);
  });

  it('debería iniciar el proceso de recuperación de contraseña', async () => {
    const res = await request(app)
      .post('/api/user/recover')
      .send({ email: recoveryEmail });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Código de recuperación enviado');
    recoveryCode = res.body.code;
  });

  it('debería permitir cambiar la contraseña con el código recibido', async () => {
    const res = await request(app)
      .post('/api/user/reset-password')
      .send({
        email: recoveryEmail,
        code: recoveryCode,
        newPassword: newRecoveryPassword
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Contraseña actualizada correctamente');
  });

  it('debería iniciar sesión con la nueva contraseña', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: recoveryEmail,
        password: newRecoveryPassword
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('Invitación de usuario guest', () => {
  const inviterEmail = 'inviter@example.com';
  const inviterPassword = 'inviter123';
  const guestEmail = 'guest@example.com';
  let inviterToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send({ email: inviterEmail, password: inviterPassword });

    await request(app)
      .put('/api/user/validation')
      .send({ email: inviterEmail, code: res.body.verificationCode });

    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: inviterEmail, password: inviterPassword });

    inviterToken = loginRes.body.token;
  });

  it('debería invitar a un usuario guest correctamente', async () => {
    const res = await request(app)
      .post('/api/user/invite')
      .set('Authorization', `Bearer ${inviterToken}`)
      .send({ email: guestEmail });

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('message', 'Usuario invitado correctamente');
    expect(res.body.guest).toHaveProperty('email', guestEmail);
    expect(res.body.guest).toHaveProperty('role', 'guest');
    expect(res.body.guest).toHaveProperty('status', 'pending');
  });
});