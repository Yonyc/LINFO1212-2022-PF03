import { Router } from "express";
import { Op } from "sequelize";
import { Appointment } from '../modules/database.js'
import { sendCustomSuccess, sendError } from "./functions.js";

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

appointmentApi.post('/reserve_room', (req, res) => {
    console.log(req);
});