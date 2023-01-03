import { Router } from "express";
import { Appointment, AppointmentDemand, Therapist, User } from '../modules/database.js'
import { checkUserLogged, getTherapist, getTherapistById, sendCustomSuccess, sendError, sendSuccess } from "./functions.js";

export const therapistApi = new Router();

therapistApi.post('/getalltherapist', async (req, res) => {
    try {
        let therapists = await Therapist.count({ where: { approved: true } });
        sendCustomSuccess(res, { count: therapists });
    } catch (error) {
        sendError(res, "Error encountred while counting active therapists", "THERAPIST_COUNT_ERROR");
    }

});

therapistApi.post("/list", async (req, res) => {
    try {
        let therapists = await Therapist.findAll({
            where: { approved: true },
            attributes: ["id", "job"],
            include: [
                {
                    model: User,
                    attributes: ["firstname", "lastname", "username", "url_pp", "email"]
                }
            ]
        });
        return sendCustomSuccess(res, { therapists: therapists });
    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }
});
