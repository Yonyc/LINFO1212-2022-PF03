import { Router } from "express";
import { Op } from "sequelize";

export const appointmentApi = new Router();

import {Appointment} from '../modules/database.js'

appointmentApi.post('/getallbooking', function(req,res){
    Appointment.count({
        where: {
            date:{
                [Op.gte]: new Date()
            }
        }
    })
    .then(data => {
        console.log(data)
        return res.json(data);
    })    
    .catch(function (reason) {
    console.log(reason);
    });
})