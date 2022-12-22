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


adminApi.post("/approvals", async (req, res) => {
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