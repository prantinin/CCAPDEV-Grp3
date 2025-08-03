const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/Users');
const ErrorModel = require('../models/Errors');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Auth Controller', () => {
  before(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB');
    await User.deleteMany({});
    await ErrorModel.deleteMany({});
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /register', () => {
    it('should register a new user', done => {
      chai.request(app)
        .post('/register')
        .send({
          fname: 'Timothy',
          lname: 'Ortiz',
          email: 'timothy_ortiz@dlsu.edu.ph',
          password: 'iLoveChikkieNuggies123',
          confirmPassword: 'iLoveChikkieNuggies123',
          role: 'student',
          idNum: '12304567'
        })
        .end(async (err, res) => {
          expect(res).to.have.status(200);
          const user = await User.findOne({ email: 'timothy_ortiz@dlsu.edu.ph' });
          expect(user).to.not.be.null;
          done();
        });
    });
  });

  describe('POST /login', () => {
    it('should log in with correct credentials', done => {
      chai.request(app)
        .post('/login')
        .send({
          email: 'timothy_ortiz@dlsu.edu.ph',
          password: 'iLoveChikkieNuggies123'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should not log to DB on incorrect password', done => {
      chai.request(app)
        .post('/login')
        .send({
          email: 'timothy_ortiz@dlsu.edu.ph',
          password: 'wrongpassword'
        })
        .end(async (err, res) => {
          expect(res.text).to.include('Incorrect password');
          const loggedError = await ErrorModel.findOne({ location: 'authController.postLogin' });
          expect(loggedError).to.be.null; // Shouldn't log auth errors unless unhandled
          done();
        });
    });
  });
});
