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
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('POST /register', () => {
    it('should register a new user', done => {
      chai.request(app)
        .post('/register')
        .send({
          fname: 'Test',
          lname: 'User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'student',
          idNum: '12101234'
        })
        .end(async (err, res) => {
          expect(res).to.have.status(200);
          const user = await User.findOne({ email: 'test@example.com' });
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
          email: 'test@example.com',
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should log error on wrong password', done => {
      chai.request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .end(async (err, res) => {
          expect(res.text).to.include('Incorrect password');
          const loggedError = await ErrorModel.findOne({ location: 'authController.postLogin' });
          expect(loggedError).to.be.null; // Should not log for incorrect password
          done();
        });
    });
  });
});
