const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const mongoose = require('mongoose');
const ErrorModel = require('../models/Errors');

chai.use(chaiHttp);
const expect = chai.expect;

describe('User Controller', () => {
  let agent;

  before(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB');
    await ErrorModel.deleteMany({});
    agent = chai.request.agent(app);

    await agent.post('/login').send({
      email: 'timothy_ortiz@dlsu.edu.ph',
      password: 'iLoveChikkieNuggies123'
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it('should return user profile if session is valid', done => {
    agent
      .get('/profile')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.include('Timothy'); // Adjust if needed
        done();
      });
  });

  it('should log error for accessing profile without login', done => {
    chai.request(app)
      .get('/profile')
      .end(async (err, res) => {
        expect(res).to.have.status(401);
        const error = await ErrorModel.findOne({ location: 'userController.getProfile' });
        expect(error).to.not.be.null;
        done();
      });
  });
});
