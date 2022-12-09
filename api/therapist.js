import { Router } from "express";

export const therapistApi = new Router();

import {Therapist} from '../modules/database.js'

therapistApi.post('/getalltherapist', function(req,res){
    Therapist.count()
    .then(data => {
        return res.json(data);
    })    
    .catch(function (reason) {
    });
})