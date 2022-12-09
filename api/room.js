import { Router } from "express";

export const roomApi = new Router();

import {Room} from '../modules/database.js'

roomApi.post('/getallrooms', function(req,res){
    Room.count({
    })
    .then(data => {
        console.log(data)
        return res.json(data);
    })    
    .catch(function (reason) {
    console.log(reason);
    });
})