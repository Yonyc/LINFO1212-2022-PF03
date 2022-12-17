import { Router } from "express";
import req from "express/lib/request";

export const therapistApi = new Router();

import {Appointment, Therapist} from '../modules/database.js'

therapistApi.post('/getalltherapist', function(req,res){
    Therapist.count({ where: { approved: true } })
    .then(data => {
        return res.json(data);
    })    
    .catch(function (reason) {
    });
})

async function setAppointment(date, duration, RoomReservation) {
    var endDate = new Date(date.getTime() + duration*60000);
    let overlaps = await Appointment.findAll({where : {date : {[Op.between] : [date, endDate]}}});

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