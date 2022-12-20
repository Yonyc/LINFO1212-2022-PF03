import { Router } from "express";
import { Room, Therapist, User, UserRoles } from "../modules/database.js";
import { sendError, sendSuccess } from "./api.js";

export const adminApi = new Router();

async function isAdmin(req) {
    let roles = await UserRoles.findAll({ where: { UserId: req.user.id } });
    roles.forEach(element => {
        if (element.RoleId == 1) {
            return true;
        }
    });

    return false;
}

adminApi.use("/", async (req, res, next) => {
    if (!req.user || !isAdmin(req)) {
        return sendError(res, "You are not an administrator", "NOT_ADMINISTRATOR", 401);
    }
    next();
});

adminApi.post("/therapist_approvals", async (req, res) => {
    res.status(200).json({
        success: true,
        therapists: await Therapist.findAll({
            where: {
                approved: false,
                rejected: false
            },
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: ["firstname", "lastname"]
                }
            ]
        })
    }).end();
});

adminApi.post("/promote", async (req, res) => {
    if (!req.body.therapist)
        return sendError(res, "Therapist id not provided", "THERAPIST_ID_MISSING");
    let therapist = await Therapist.findByPk(req.body.therapist);
    if (!therapist)
        return sendError(res, "Therapist does not exists", "THERAPIST_NOT_FOUND");

    try {
        therapist.approved = true;
        await therapist.save();
        return sendSuccess(res, "Therapist has been promoted", "THERAPIST_PROMOTE_SUCCESS");
    } catch (error) {
        return sendError(res, "Error encoutred while promoting therapist", "THERAPIST_PROMOTE_ERROR")
    }
});

adminApi.post("/refuse", async (req, res) => {
    if (!req.body.therapist)
        return sendError(res, "Therapist id not provided", "THERAPIST_ID_MISSING");
    let therapist = await Therapist.findByPk(req.body.therapist);
    if (!therapist)
        return sendError(res, "Therapist does not exists", "THERAPIST_NOT_FOUND");

    try {
        therapist.rejected = true;
        await therapist.save();
        return sendSuccess(res, "Therapist has been rejected", "THERAPIST_REJECT_SUCCESS");
    } catch (error) {
        return sendError(res, "Error encoutred while rejecting therapist", "THERAPIST_REJECT_ERROR")
    }
});

adminApi.post("/createroom", async (req, res) => {
    if (!req.body.roomName)
        return sendError(res, "No room name provided", "ROOM_NO_NAME");

    let roomData = { name: req.body.roomName };

    if (req.body.roomSize)
        roomData.size = req.body.roomSize;

    if (req.body.roomDescription)
        roomData.description = req.body.roomDescription;

    try {
        let newRoom = await Room.create(roomData);
        sendSuccess(res, "New room sucessfully created !", "ROOM_CREATED");
    } catch (error) {
        sendError(res, "Error encountred while creating new room")
    }
});