import { Router } from "express";

export const roomApi = new Router();

import { Room } from '../modules/database.js'
import { sendCustomSuccess, sendError } from "./api.js";

roomApi.post('/getallrooms', async (req, res) => {
    try {
        let rooms = await Room.count();
        sendCustomSuccess(res, { count: rooms });
    } catch (error) {
        sendError(res, "Error encountred while counting rooms", "ROOM_COUNT_ERROR");
    }
})