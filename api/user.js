import { Router } from "express";

export const userApi = new Router();

/* 
    User have a token to send in the req.body for profile edit
*/

userApi.post("/login", (req, res) => {
    // req.body for POST request's body
    res.json({
        success: true,
        data: {
            username: "Yonyc",
            firstname: "Arnaud",
            lastname: "Wery",
            email: "arnaudwery24@gmail.com",
            mobile: "0469696969",
            phone: null,
            address: "Ici",
            website: "https://centre-tremplin.be",
            instagram: null,
            facebook: null,
            url_pp: "https://scontent-bru2-1.xx.fbcdn.net/v/t39.30808-6/241771405_1489509348094192_8935272199923345073_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=D0bbwGs9JeoAX_GIN-w&_nc_ht=scontent-bru2-1.xx&oh=00_AfDzgBm_TuY6uICoskWCENp5kzYI0sqQhPArEiCT295-xA&oe=6395AA30"
        }
    }); // Response example
});

userApi.post("/register", (req, res) => {
    res.json({
        success: false,
        data: {
            message: "Username is already taken"
        }
    }); // Response example
});

userApi.post("/edit", (req, res) => {
    res.json({
        success: false,
        data: {
            message: "Username is already taken"
        }
    }); // Response example
});