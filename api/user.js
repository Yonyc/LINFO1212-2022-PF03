import { Router } from "express";
import { User, Therapist } from '../modules/database.js';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from "passport-local";
import multer from 'multer';
import path from 'path';
import { isPhone, sendCustomSuccess, sendError, sendSuccess } from "./functions.js";
import { checkUserLogged } from "./functions.js";

export const userApi = new Router();

const salt = "$2b$10$XzJlrKQwqwFg4DZNXmmHPO";

async function getUser(username) {
    return User.findOne({ where: { username: username } });
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

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.username
        });
    });
});

passport.deserializeUser(function (id, done) {
    getUser(id.username).then(user => {
        done(null, user);
    }).catch(err => done(err));
});

//=================================================================================================
userApi.post('/getallusers', async (req, res) => {
    try {
        let users = await User.count();
        sendCustomSuccess(res, { count: users });
    } catch (error) {
        sendError(res, "Error encountred while counting users", "USER_COUNT_ERROR");
    }
});

function checkUserData(req, res, ignore = {}) {
    if (!ignore.username && (!req.body.username || req.body.username.length < 3))
        return res.status(400).send({
            error: 'username'
        });

    if (!ignore.firstname && (!req.body.firstname || req.body.firstname.length <= 0))
        return res.status(400).send({
            error: 'firstname'
        });

    if (!ignore.username && (!req.body.lastname || req.body.lastname.length <= 0))
        return res.status(400).send({
            error: 'lastname'
        });

    if (!ignore.username && (!req.body.email || req.body.email.length <= 0 || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(req.body.email)))
        return res.status(400).send({
            error: 'email'
        });

    if (!ignore.password && (!req.body.password || req.body.password.length < 8))
        return res.status(400).send({
            error: 'password'
        });

    if (!ignore.phone && (req.body.phone && req.body.phone.length > 0 && !isPhone(req.body.phone)))
        return res.status(400).send({
            error: 'phone'
        });

    if (!ignore.mobilephone && (req.body.mobilephone && req.body.mobilephone.length > 0 && !isPhone(req.body.mobilephone)))
        return res.status(400).send({
            error: 'mobilephone'
        });
}

userApi.post('/register', function (req, res) {
    //var userData = [req.body.email, req.body.username, hashed, req.body.firstname, req.body.lastname, req.body.phone, req.body.mobilephone, req.body.address];

    let userDataValidated = checkUserData(req, res);
    if (userDataValidated) return userDataValidated;
    let hashed = bcrypt.hashSync(req.body.password, salt);


    User.findOne({
        where: {
            email: req.body.email,
            username: req.body.username
        }

    }).then(users => {
        if (users) {
            return res.status(400).send({
                error: 'exists'
            });
        }
        else {
            User.create({
                email: req.body.email,
                username: req.body.username,
                password: hashed,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phone,
                mobilephone: req.body.mobilephone,
                address: req.body.address,
                url_pp: "/img/profile_pictures/photo-anonyme.png",
                confirmed: false
            }).then(users => {
                return res.status(200).send({
                    error: 'none'
                });
            }).catch(function (reason) {
                console.log("Account creation Rejected");
                if (reason.errors[0].type == "Validation error" && reason.errors[0].path == "email") {
                    return res.status(400).send({
                        error: 'email_taken'
                    });
                }
            });
        }
    }).catch(function (reason) {
        console.log(reason);
    });
})

userApi.post('/login', passport.authenticate('local', {}), function (req, res) {
    let data = {
        success: true,
        user: {
            username: req.user.username,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            email: req.user.email,
            phone: req.user.phone,
            mobilephone: req.user.mobilephone,
            address: req.user.address,
            url_pp: req.user.url_pp
        }
    };
    return res.status(200).send(data);
});

userApi.get('/logout', function (req, res) {
    req.logout((err) => {
        if (err)
            return sendError(res, "Une erreur innatendue s'est produite.", "UNEXPECTED_ERROR");
        return sendSuccess(res);
    });
});

userApi.post('/edit', async function (req, res) {
    if (!checkUserLogged(req, res)) return;
    let userDataValidated = checkUserData(req, res, { password: true });
    if (userDataValidated) return userDataValidated;

    let euser = await User.findOne({
        where: { email: req.body.email }
    })

    if (euser && euser.username != req.user.username) {
        return res.status(400).send({
            error: 'email_taken'
        });
    }

    let uuser = await User.findOne({
        where: { username: req.body.username }
    })

    if (uuser && uuser.email != req.user.email) {
        return res.status(400).send({
            error: 'username_taken'
        });
    }

    await User.update(
        {
            email: req.body.email,
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            phone: req.body.phone,
            mobilephone: req.body.mobilephone,
            address: req.body.address,
        },
        {
            where: { username: req.user.username },
        }
    );

    const updatedUser = req.user;
    updatedUser.email = req.body.email;
    updatedUser.username = req.body.username;
    updatedUser.firstname = req.body.firstname;
    updatedUser.lastname = req.body.lastname;
    updatedUser.phone = req.body.phone;
    updatedUser.mobilephone = req.body.mobilephone;
    updatedUser.address = req.body.address;


    req.login(updatedUser, async (error) => {
        if (error) {
            return res.status(400).send({
                error: 'updateError'
            });
        }

        return res.status(200).send({
            error: 'none'
        });
    });
});

const __dirname = path.resolve();
const uploadDir = __dirname + "/public/img/profile_pictures/";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: async (req, file, cb) => {
        let fileName = Date.now() + path.extname(file.originalname);
        let file_path = uploadDir + fileName;
        let db_path = file_path.substring(file_path.indexOf("/public/") + 8);
        await User.update(
            {
                url_pp: db_path
            },
            {
                where: { username: req.user.username },
            }
        );
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    if (!checkUserLogged(req, null)) return;
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

userApi.post('/upload_profile_picture', upload.single('profile_picture'), (req, res) => {
    if (!checkUserLogged(req, res)) return;
    if (!req.file || !req.file.path)
        return res.status(400).send({
            error: 'file_missing'
        });
    let db_path = req.file.path.substring(req.file.path.indexOf("/public/") + 8);
    return res.status(200).send({
        error: 'none',
        new_url: db_path
    });
});

userApi.post('/therapist_promotion', async (req, res) => {
    if (!checkUserLogged(req, res)) return;

    try {
        let [therapist, success] = await Therapist.findOrCreate({
            where: {
                UserId: req.user.id
            },
            defaults: {
                approved: false
            }
        });
        await User.update(
            {
                TherapistId: therapist.id
            },
            {
                where: { id: req.user.id },
            }
        );
        return res.status(200).json({
            error: 'none'
        });
    } catch (error) {
        return res.status(400).json({
            error: 'unknown'
        });
    }
});

userApi.post("/info_therapist", async (req, res) => {
    if (!checkUserLogged(req, res)) return;

    let therapist = await Therapist.findOne({ where: { UserId: req.user.id } });

    let r = { success: true, asked: Boolean(therapist) };
    if (!therapist || !therapist.approved)
        return res.status(200).json(r);
    r.therapist = therapist;
    return res.status(200).json(r);
});