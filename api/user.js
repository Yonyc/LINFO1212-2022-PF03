import { Router } from "express";

export const userApi = new Router();

/* 
    User have a token to send in the req.body for profile edit
*/

import {User} from '../modules/database.js'
import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy as LocalStrategy } from "passport-local"

const salt = "$2b$10$XzJlrKQwqwFg4DZNXmmHPO";

async function getUser(username) {
    return User.findOne({where: { username: username }});
}

passport.use(new LocalStrategy(
    function (username, password, done) {
        getUser(username)
            .then(function (users) {
                if (!users) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (users.password == bcrypt.hashSync(password, salt)) {
                  return done(null, users);
                }
                return done(null, false, { message: 'Incorrect password.' });
            })
            .catch(err => done(err));
    }  
));
    
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username
      });
    });
  });

passport.deserializeUser(function(id, done) {
  getUser(id.username).then(user => {
    done(null, user);
  }).catch(err => done(err));
});

//=================================================================================================

import bodyParser from 'body-parser'

userApi.use((bodyParser.urlencoded({ extended: false })))
userApi.use(bodyParser.json());

userApi.post('/register', function(req,res){
    let hashed = bcrypt.hashSync(req.body.password, salt);
    var userData = [req.body.email, req.body.username, hashed, req.body.firstname, req.body.lastname, req.body.phone, req.body.mobile, req.body.address];
    User.findOne({
       where: { email: userData[0],
        username: userData[1]
       }

    }).then(users => {
        if (users) {
            return res.status(200).send({
                error: 'none'
            });
        }
        else{
            User.create({
                email: userData[0],
                username: userData[1],
                password: userData[2],
                firstname: userData[3],
                lastname: userData[4],
                phone: userData[5],
                mobilephone: userData[6],
                address: userData[7],
                url_pp: "public/img/profile_pictures/photo-anonyme.png",
                confirmed: false

          }).then(users => {
            return res.status(200).send({
                error: 'none'
            });
          }).catch(function (reason) {
            console.log("Account creation Rejected");
            if (reason.errors[0].type == "Validation error" && reason.errors[0].path == "email") {
                return res.status(400).send({
                    error: 'email'
                });
            }
       });    
        }
    }).catch(function (reason) {
        console.log(reason);
   });
})

userApi.post('/login', passport.authenticate('local', {}),
function(req, res) {
    let data = {
      success: true,
      user: {
        username: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        phone: req.user.phone,
        mobile: req.user.mobilephone,
        address: req.user.address,
      }
    };
    return res.status(200).send(data);
});

userApi.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});