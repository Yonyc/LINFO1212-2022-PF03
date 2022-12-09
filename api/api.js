import { Router } from "express";
import { appointmentApi } from "./appointment.js";
import { roomApi } from "./room.js";
import { userApi } from "./user.js";

export const api = new Router();


api.use("/user", userApi);

api.use("/appointment", appointmentApi);

api.use("/room", roomApi);

api.use('/', (req, res) => {
    res.json({
        success: false,
        data: {
            message: "No route found!"
        }
    });
});