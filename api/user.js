import { Router } from "express";

export const userApi = new Router();

userApi.post("/login", (req, res) => {
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
    })
});