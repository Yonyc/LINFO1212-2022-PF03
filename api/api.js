import { Router } from "express";
import { adminApi } from "./admin.js";
import { appointmentApi } from "./appointment.js";
import { roomApi } from "./room.js";
import { therapistApi } from "./therapist.js";
import { userApi } from "./user.js";

export const api = new Router();


api.use("/user", userApi);

api.use("/appointment", appointmentApi);

api.use("/room", roomApi);

api.use("/therapist", therapistApi);

api.use("/admin", adminApi);

api.use('/', (req, res) => {
    res.json({
        success: false,
        data: {
            message: "No route found!"
        }
    });
});