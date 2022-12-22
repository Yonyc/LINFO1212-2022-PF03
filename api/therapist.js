import { Router } from "express";
import { Appointment, Therapist } from '../modules/database.js'
import { sendCustomSuccess, sendError, sendSuccess } from "./functions.js";

export const therapistApi = new Router();

therapistApi.post('/getalltherapist', async (req, res) => {
    try {
        let therapists = await Therapist.count({ where: { approved: true } });
        sendCustomSuccess(res, { count: therapists });
    } catch (error) {
        sendError(res, "Error encountred while counting active therapists", "THERAPIST_COUNT_ERROR");
    }

});

async function setAppointment(date, duration, RoomReservation) {
    var endDate = new Date(date.getTime() + duration * 60000);
    let overlaps = await Appointment.findAll({ where: { date: { [Op.between]: [date, endDate] } } });

    if (overlaps) {
        return false;
    }

    let newAppointment = await Appointment.create({
        UserId: req.user.id,
        date: date,
        duration: duration,
        RoomReservationId: RoomReservation.id
    });

    return newAppointment;
}