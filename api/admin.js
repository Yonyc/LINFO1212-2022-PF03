import { Router } from "express";
import { Therapist, User } from "../modules/database.js";
import { adminRoomApi } from "./admin/room.js";
import { adminTherapistApi } from "./admin/therapist.js";
import { isAdmin, sendError, sendSuccess } from "./functions.js";

export const adminApi = new Router();

adminApi.use("/", async (req, res, next) => {
    if (!req.user || !(await isAdmin(req))) {
        return sendError(res, "You are not an administrator", "NOT_ADMINISTRATOR", 401);
    }
    next();
});

adminApi.use("/room", adminRoomApi);

adminApi.use("/therapist", adminTherapistApi);