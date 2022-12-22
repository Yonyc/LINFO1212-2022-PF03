import { Router } from "express";
import { Therapist, User } from "../../modules/database.js";
import { sendCustomSuccess, sendError } from "../functions.js";

export const adminTherapistApi = new Router();

adminTherapistApi.post("/all", async (req, res) => {
    let therapists;
    try {
        therapists = await Therapist.findAll({
            where: {
                approved: true
            },
            attributes: ["id"],
            include: [
                {
                    model: User,
                    attributes: ["firstname", "lastname"],
                }
            ]
        });
    } catch (error) {
        console.error(error);
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR", 500);
    }

    return sendCustomSuccess(res, {
        therapists: therapists
    })
});