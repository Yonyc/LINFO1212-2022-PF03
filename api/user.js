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
            facebook: null
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