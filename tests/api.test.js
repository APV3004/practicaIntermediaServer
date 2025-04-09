const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // solo 'app', no 'server'
const { encrypt } = require('../utils/handlePassword.js')
const { tokenSign } = require('../utils/handleToken.js')
const initialUsers = [
    {
        name: "Marcos",
        age: 23,
        email: "marcos@correo.es",
        password: "mipassword"
    }
]

require('dotenv').config();

const api = supertest(app);

// Aumentamos el timeout por si Mongo tarda en responder
jest.setTimeout(15000);

let token
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  
    await usersModel.deleteMany({});
  
    const password = await encrypt(initialUsers[0].password);
    const body = { ...initialUsers[0], password };
  
    const userData = await usersModel.create(body);
    userData.set("password", undefined, { strict: false });
  
    token = await tokenSign(userData, process.env.JWT_SECRET);
  });

// ✅ Test funcional
it('should get all users', async () => {
    await api
        .get('/api/user')
        .expect(200)
        .expect('Content-Type', /application\/json/);
});

// 🔒 Cerramos conexión al finalizar
afterAll(async () => {
    await mongoose.connection.close();
});