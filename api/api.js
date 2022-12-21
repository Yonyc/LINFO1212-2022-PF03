import { Router } from "express";
import { adminApi } from "./admin.js";
import { appointmentApi } from "./appointment.js";
import { roomApi } from "./room.js";
import { therapistApi } from "./therapist.js";
import { userApi } from "./user.js";

export function sendCustomError(res, data, suppData = {}, http_code = 200) {
    return res.status(http_code).json({
        success: false,
        data: {...data, ...suppData}
    }).end();
}

export function sendError(res, message, code, http_code = 200) {
    return sendCustomError(res, {
        message: message,
        code: code
    }, null, http_code);
}

export function sendCustomSuccess(res, data, suppData = {}, http_code = 200) {
    return res.status(http_code).json({
        success: true,
        data: {...data, ...suppData}
    }).end();
}

export function sendSuccess(res, message, code, http_code = 200) {
    return sendCustomSuccess(res, {
        message: message,
        code: code
    }, null, http_code);
}

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