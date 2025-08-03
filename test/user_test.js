const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/Users');

chai.use(chaiHttp);
const expect = chai.expect;

describe('User Controller', () => {
  before(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/labubuddiesDB');
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it('should return user profile if session is valid', done => {
    const agent = chai.request.agent(app);
    agent
      .post('/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .end(() => {
        agent.get('/profile')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.text).to.include('Test');
            done();
          });
      });
  });
});
