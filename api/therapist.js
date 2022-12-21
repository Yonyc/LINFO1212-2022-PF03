import { Router } from "express";
import { Appointment, Therapist } from '../modules/database.js'
import { sendCustomSuccess, sendError, sendSuccess } from "./api.js";
import { checkUserLogged } from "./user.js";

export const therapistApi = new Router();

export async function checkUserTherapist(req, res) {
    if (!checkUserLogged(req, res)) return false;
    try {
        let therapist = Therapist.findAll({
            where: {
                UserId: req.user.id
            }
        });
        if (therapist) 
            return true;
    } catch (error) {}
    sendError(res, "You need to be a therapist to access this ressource", "USER_NOT_THERPIST");
    return false;
}

therapistApi.post('/getalltherapist', async (req, res) => {
    try {
        let therapists = await Therapist.count({ where: { approved: true } });
        sendCustomSuccess(res, { count: therapists });
    } catch (error) {
        sendError(res, "Error encountred while counting active therapists", "THERAPIST_COUNT_ERROR");
    }

})

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

async function bookRoom(room, therapist, start, end) {

}