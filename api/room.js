import { Router } from "express";
import { Room, RoomReservations } from '../modules/database.js'
import { sendCustomSuccess, sendError, sendSuccess } from "./api.js";
import { Op } from "sequelize";

export const roomApi = new Router();


roomApi.post('/getallrooms', async (req, res) => {
    try {
        let rooms = await Room.count();
        return sendCustomSuccess(res, { count: rooms });
    } catch (error) { }
    return sendError(res, "Error encountred while counting rooms", "ROOM_COUNT_ERROR");
})

roomApi.post('/display_infos', async (req, res) => {
    try {
        let rooms = await Room.findAll({ attributes: ["id", "name", "description", "size"] });
        return sendCustomSuccess(res, {
            roomList: rooms
        })
    } catch (error) { }
    return sendError(res, "Error encountred while fetching rooms infos.", "ROOM_DATA_ERROR");
});

roomApi.post('/calendar', async (req, res) => {
    let where = {
        start: {
            [Op.lte]: req.body.end
        },
        end: {
            [Op.gte]: req.body.start
        }
    };

    if (req.body.roomID)
        where.RoomId = req.body.roomID;

    try {
        let rooms = await RoomReservations.findAll({
            where: where,
            attributes: ["id", "start", "end", "RoomId"],
            include: [
                {
                    model: Room,
                    attributes: ["name"]
                }
            ]
        });
        return res.status(200).json(rooms.map(r => { return { ...r.dataValues, title: r.dataValues.Room.name } })).end();
    } catch (error) { }
    return sendError(res, "Error encountred while fetching rooms reservations.", "ROOM_RESERVATIONS_DATA_ERROR");
});