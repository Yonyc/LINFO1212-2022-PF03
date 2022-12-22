import { Router } from "express";
import { User, Therapist } from '../modules/database.js';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from "passport-local";
import multer from 'multer';
import path from 'path';
import { sendCustomSuccess, sendError, sendSuccess } from "./functions.js";
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

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

userApi.post('/register', function (req, res) {
    let hashed = bcrypt.hashSync(req.body.password, salt);
    var userData = [req.body.email, req.body.username, hashed, req.body.firstname, req.body.lastname, req.body.phone, req.body.mobile, req.body.address];
    if (!isNumeric(userData[5]) || !isNumeric(userData[6])) {
        return res.status(400).send({
            error: 'phone'
        });
    }
    userData.forEach(element => {
        if (element == "") {
            return res.status(400).send({
                error: 'empty'
            });
        }
    });
    User.findOne({
        where: {
            email: userData[0],
            username: userData[1]
        }

    }).then(users => {
        if (users) {
            return res.status(200).send({
                error: 'none'
            });
        }
        else {
            User.create({
                email: userData[0],
                username: userData[1],
                password: userData[2],
                firstname: userData[3],
                lastname: userData[4],
                phone: userData[5],
                mobilephone: userData[6],
                address: userData[7],
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
                        error: 'email'
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
            mobile: req.user.mobilephone,
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
    var userData = [req.body.email, req.body.username, req.body.firstname, req.body.lastname, req.body.phone, req.body.mobile, req.body.address];

    if (!isNumeric(userData[5]) || !isNumeric(userData[4])) {
        return res.status(400).send({
            error: 'phone'
        });
    }

    userData.forEach(element => {
        if (element == "") {
            return res.status(400).send({
                error: 'empty'
            });
        }
    });

    let euser = await User.findOne({
        where: { email: userData[0] }
    })

    if (euser && euser.username != req.user.username) {
        return res.status(400).send({
            error: 'emailTaken'
        });
    }

    let uuser = await User.findOne({
        where: { username: userData[1] }
    })

    if (uuser && uuser.email != req.user.email) {
        return res.status(400).send({
            error: 'usernameTaken'
        });
    }

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
    updatedUser.email = userData[0];
    updatedUser.username = userData[1];
    updatedUser.firstname = userData[2];
    updatedUser.lastname = userData[3];
    updatedUser.phone = userData[4];
    updatedUser.mobilephone = userData[5];
    updatedUser.address = userData[6];


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