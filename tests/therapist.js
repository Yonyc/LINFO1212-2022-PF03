import session from 'supertest-session';
import { Therapist, User } from '../modules/database.js';
import {app} from '../server.js';

var testSession = null;

beforeEach(function () {
  testSession = session(app);
});

export const testSuite3 = () => describe('Therapist promotion', function () {
    var authenticatedSession;
   
    beforeEach(function (done) {
      testSession.post('/api/user/login').type('form')
        .send({
          username: 'test',
          password: 'test'
        })
        .expect(200)
        .end(function (err) {
          if (err) return done(err);
          authenticatedSession = testSession;
          return done();
        });
    });
   
    it('Successful therapist demand', async () => {
      const res = await authenticatedSession
        .post('/api/user/therapist_promotion')
        expect(res.statusCode).toEqual(200)

        const user = await User.findOne({where: { username: "test" }});

        await Therapist.destroy({
          where: { UserId: user.id },
        });
        await User.destroy({
          where: { username: "test" },
        });
    });
});