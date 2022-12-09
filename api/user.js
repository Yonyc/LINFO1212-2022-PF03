import { Router } from "express";

export const userApi = new Router();

/* 
    User have a token to send in the req.body for profile edit
*/

import {User} from '../modules/database.js'
import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy as LocalStrategy } from "passport-local"

userApi.use(passport.initialize());
userApi.use(passport.session());

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

userApi.post('/getallusers', function(req,res){
  User.count()
    .then(data => {
        console.log(data)
        return res.json(data);
     })    
      .catch(function (reason) {
      console.log(reason);
 });
})

userApi.post('/register', function(req,res){
    let hashed = bcrypt.hashSync(req.body.password, salt);
    var userData = [req.body.email, req.body.username, hashed, req.body.firstname, req.body.lastname, req.body.phone, req.body.mobile, req.body.address];
    userData.forEach(element => {
      if (element == "") {
        return res.status(400).send({
          error: 'empty'
      });
      }
    });
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

userApi.post('/edit', async function(req,res){
  var userData = [req.body.email, req.body.username, req.body.firstname, req.body.lastname, req.body.phone, req.body.mobile, req.body.address];
  userData.forEach(element => {
    if (element == "") {
      return res.status(400).send({
        error: 'empty'
      });
    }
  });
  
  await User.update(
    {
      email: userData[0],
      username: userData[1],
      firstname: userData[2],
      lastname: userData[3],
      phone: userData[4],
      mobilephone: userData[5],
      address: userData[6],
    },
    {
      where: { username: req.user.username },
    }
  );

  const updatedUser = req.user;
  updatedUser.email= userData[0];
  updatedUser.username= userData[1];
  updatedUser.firstname= userData[2];
  updatedUser.lastname= userData[3];
  updatedUser.phone= userData[4];
  updatedUser.mobilephone= userData[5];
  updatedUser.address= userData[6];


  req.login(updatedUser, async(error) => {
    if (error) {
      return res.status(400).send({
        error: 'updateError'
      });
    }

    return res.status(200).send({
      error: 'none'
    });
  });
})