import request from 'supertest';
import { User } from '../modules/database.js';
import {app} from '../server.js';

describe('Register', () => {
    it('wrong phone number', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
            email: "test@test.com",
            username: "test",
            password: "test",
            firstname: "test",
            lastname: "test",
            phone: "a",
            mobile: "0",
            address: "test"
        })
      expect(res.statusCode).toEqual(400)
    })

    it('invalid email', async () => {
        const res = await request(app)
          .post('/api/user/register')
          .send({
              email: "test",
              username: "test",
              password: "test",
              firstname: "test",
              lastname: "test",
              phone: "0",
              mobile: "0",
              address: "test"
          })
        expect(res.statusCode).toEqual(400)
      })
  
    it('right credentials', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
            email: "test@test.com",
            username: "test",
            password: "test",
            firstname: "test",
            lastname: "test",
            phone: "0",
            mobile: "0",
            address: "test"
        })
      expect(res.statusCode).toEqual(200)
    })

    it('user exists', async () => {
        const res = await request(app)
          .post('/api/user/register')
          .send({
              email: "test@test.com",
              username: "test",
              password: "test",
              firstname: "test",
              lastname: "test",
              phone: "0",
              mobile: "0",
              address: "test"
          })
        expect(res.statusCode).toEqual(400)
      })
})

describe('Login', () => {
    it('wrong credentials', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
          username: 'teeest',
          password: 'test'
        })
      expect(res.statusCode).toEqual(401)
    })
  
    it('right credentials', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
            username: 'test',
            password: 'test'
          })
      expect(res.statusCode).toEqual(200)
      await User.destroy({
        where: { username: "test" },
      });
    })
})