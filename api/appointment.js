import { Router } from "express";
import { Op } from "sequelize";
import { Appointment, AppointmentDemand, sequelize, Therapist, User } from '../modules/database.js'
import { checkUserLogged, checkUserTherapist, getTherapist, getTherapistById, sendCustomSuccess, sendError, sendSuccess } from "./functions.js";

export const appointmentApi = new Router();

appointmentApi.post('/getallbooking', async (req, res) => {
    try {
        let appointments = await Appointment.count({
            where: {
                date: {
                    [Op.gte]: new Date()
                }
            }
        });
        sendCustomSuccess(res, { count: appointments });
    } catch (error) {
        sendError(res, "Error encountred while counting incoming appointments", "APPOINTMENT_COUNT_ERROR");
    }
});

appointmentApi.post("/ask_appointment", async (req, res) => {
    if (!checkUserLogged(req, res)) return false;

    if (!req.body.therapist) return sendError(res, "Erreur, aucun thérapeute sélectionné.", "THERAPIST_NOT_SELECTED");
    if (!req.body.date) return sendError(res, "Erreur, aucune date sélectionnée.", "THERAPIST_DATE_NOT_SELECTED");
    if (!req.body.duration) return sendError(res, "Erreur, aucune durée sélectionnée.", "THERAPIST_DURATION_NOT_SELECTED");
    if (!req.body.reccurence) return sendError(res, "Erreur, aucune réccurence sélectionnée.", "THERAPIST_RECCURENCE_NOT_SELECTED");
    if (!req.body.end_reccurence) return sendError(res, "Erreur, aucune fin de réccurence spécifiée.", "THERAPIST_ENDRECCURENCE_NOT_SELECTED");

    let start;
    try {
        start = new Date(req.body.date);
    } catch (error) {
        return sendError(res, "Erreur lors de la conversion de la date.", "DATE_FORMAT_ERROR");
    }

    let end_reccurence;
    try {
        end_reccurence = new Date(req.body.end_reccurence);
    } catch (error) {
        return sendError(res, "Erreur lors de la conversion de la date.", "DATE_FORMAT_ERROR");
    }

    if (start < new Date()) return sendError(res, "La date de la réservation ne peut être antérieure à maintenant.", "THERAPIST_RESERVATION_TOO_SOON");

    if (start.getHours() < 7) return sendError(res, "L'heure de la réservation ne peut pas être avant 7h.", "THERAPIST_RESERVATION_TOO_EARLY");

    try {
        let duration = parseFloat(req.body.duration);
        let therapist = await getTherapistById(req.body.therapist);

        if (!therapist) return sendError(res, "Thérapeute non trouvé", "THERAPIST_NOT_FOUND");

        await AppointmentDemand.create({
            date: start,
            duration: duration,
            reccurence: req.body.reccurence,
            reccurenceEnd: end_reccurence,
            UserId: req.user.id,
            TherapistId: therapist.id
        });

        sendSuccess(res);
    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }
});

appointmentApi.post("/my_appointments", async (req, res) => {
    if (!checkUserLogged(req, res)) return false;

    try {
        let appointments = await AppointmentDemand.findAll({
            where: {
                UserId: req.user.id
            },
            attributes: ["id", "date", "duration", "reccurence", "reccurenceEnd", "refused", "accepted"],
            include: [
                {
                    model: Therapist,
                    attributes: ["id", "job"],
                    include: [
                        {
                            model: User,
                            attributes: ["firstname", "lastname"]
                        }
                    ]
                }
            ]
        });
        return sendCustomSuccess(res, { appointments: appointments });
    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }
});

appointmentApi.post("/cancel", async (req, res) => {
    try {
        let appointment = await AppointmentDemand.findByPk(req.body.appointmentDemand);
        if (!appointment) return sendError(res, "La demande n'existe pas", "APPOINTMENT_DEMAND_DOES_NOT_EXISTS");
        if (appointment.accepted) return sendError(res, "La demande a déjà étée acceptée", "APPOINTMENT_DEMAND_ALREADY_ACCEPTED");
        await appointment.destroy();
        return sendSuccess(res, "La demande à étée supprimée", "APPOINTMENT_DEMAND_DELETED");
    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }
});

appointmentApi.post("/therapist_demands", async (req, res) => {
    if (!checkUserTherapist(req, res)) return;
    try {
        let therapist = await getTherapist(req);
        let appointments = await AppointmentDemand.findAll({
            where: {
                TherapistId: therapist.id
            },
            attributes: ["id", "date", "duration", "reccurence", "reccurenceEnd", "refused", "accepted"],
            include: [
                {
                    model: User,
                    attributes: ["firstname", "lastname"]
                }
            ],
            order: [
                ['accepted', 'DESC'],
                ['refused', 'ASC']
            ]
        });
        return sendCustomSuccess(res, { appointments: appointments });
    } catch (error) {
        console.error(error)
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }
});

appointmentApi.post("/accept", async (req, res) => {
    if (!checkUserTherapist(req, res)) return;
    try {
        let appointment = await AppointmentDemand.findByPk(req.body.appointmentDemand);
        if (!appointment) return sendError(res, "La demande n'existe pas", "APPOINTMENT_DEMAND_DOES_NOT_EXISTS");
        appointment.accepted = true;
        appointment.refused = false;
        await appointment.save();
        return sendSuccess(res, "La demande à étée acceptée", "APPOINTMENT_DEMAND_ACCEPTED");
    } catch (error) {
        console.error(error);
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }
});

appointmentApi.post("/refuse", async (req, res) => {
    if (!checkUserTherapist(req, res)) return;
    try {
        let appointment = await AppointmentDemand.findByPk(req.body.appointmentDemand);
        if (!appointment) return sendError(res, "La demande n'existe pas", "APPOINTMENT_DEMAND_DOES_NOT_EXISTS");
        appointment.accepted = false;
        appointment.refused = true;
        await appointment.save();
        return sendSuccess(res, "La demande à étée refusée", "APPOINTMENT_DEMAND_ACCEPTED");
    } catch (error) {
        console.error(error);
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }
});