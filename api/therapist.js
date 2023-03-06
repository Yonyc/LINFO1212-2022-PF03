import { Router } from "express";
import { Therapist, User } from '../modules/database.js';
import { checkUserTherapist, getTherapist, sendCustomSuccess, sendError, sendSuccess } from "./functions.js";

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
            where: { approved: true, shown: true },
            attributes: ["id", "job", "whoami", "infos", "whatido"],
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

therapistApi.post("/infos", async (req, res) => {
    if (!req.body.therapistID) return sendError(res, "Id de therapeute manquant", "THERAPIST_ID_MISSING");
    try {
        let therapists = await Therapist.findAll({
            where: { approved: true, shown: true, id: req.body.therapistID },
            attributes: ["id", "job", "whoami", "infos", "whatido"],
            include: [
                {
                    model: User,
                    attributes: ["firstname", "lastname", "url_pp"]
                }
            ]
        });
        if (therapists.length != 1) return sendError(res, "Thérapeute non trouvé", "THERAPIST_MISSING");
        return sendCustomSuccess(res, { therapist: therapists[0] });
    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }
});

therapistApi.post("/data", async (req, res) => {
    if (!await checkUserTherapist(req, res)) return;

    let therapist = await getTherapist(req);

    return sendCustomSuccess(res, {
        shown: therapist.shown,
        job: therapist.job,
        content: therapist.description,
        whoami: therapist.whoami,
        whatido: therapist.whatido,
        infos: therapist.infos
    });
    
});

therapistApi.post("/edit/job", async (req, res) => {
    if (!await checkUserTherapist(req, res)) return;
    if (!req.body.job) return sendError(res, "Job name missing", "JOB_MISSING", 400);
    if (req.body.job > 20) return sendError(res, "Job name too long", "JOB_TOO_LONG");

    try {
        let therapist = await getTherapist(req);
    
        therapist.job = req.body.job;

        therapist.save();
    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }

    return sendSuccess(res);
});

therapistApi.post("/edit/shown", async (req, res) => {
    if (!await checkUserTherapist(req, res)) return;
    if (typeof req.body.shown !== "boolean") return sendError(res, "Must be true ir false", "SHOWN_ERROR", 400);
    
    try {
        let therapist = await getTherapist(req);
    
        therapist.shown = req.body.shown;

        therapist.save();

    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }

    return sendSuccess(res);
});

therapistApi.post("/edit/whoami", async (req, res) => {
    if (!await checkUserTherapist(req, res)) return;

    try {
        let therapist = await getTherapist(req);
    
        therapist.whoami = req.body.data ?? "";

        therapist.save();

    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }

    return sendSuccess(res);
});

therapistApi.post("/edit/whatido", async (req, res) => {
    if (!await checkUserTherapist(req, res)) return;

    try {
        let therapist = await getTherapist(req);
    
        therapist.whatido = req.body.data ?? "";

        therapist.save();

    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }

    return sendSuccess(res);
});

therapistApi.post("/edit/infos", async (req, res) => {
    if (!await checkUserTherapist(req, res)) return;

    try {
        let therapist = await getTherapist(req);
    
        therapist.infos = req.body.data ?? "";

        therapist.save();

    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }

    return sendSuccess(res);
});