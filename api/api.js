import { Router } from "express";
import { userApi } from "./user.js";

export const api = new Router();

api.use("/user", userApi);

api.use('/', (req, res) => {
    res.json({
        success: false,
        data: {
            message: "No route found!"
        }
    });
});