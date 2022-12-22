import { Router } from "express";
import { adminApi } from "./admin.js";
import { appointmentApi } from "./appointment.js";
import { sendError } from "./functions.js";
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
    sendError(res, "No route found :/", "NOT_FOUND_ROUTE", 404);
});

console.log("API LOADED !");