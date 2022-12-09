import { Router } from "express";

export const roomApi = new Router();

import {Room} from '../modules/database.js'

roomApi.post('/getallrooms', function(req,res){
    Room.count()
    .then(data => {
        return res.json(data);
    })    
    .catch(function (reason) {
    });
})