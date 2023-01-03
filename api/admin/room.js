import { Router } from "express";
import { Op } from "sequelize";
import { Room, RoomPrice, Therapist } from "../../modules/database.js";
import { sendError, sendSuccess } from "../functions.js";

export const adminRoomApi = new Router();

adminRoomApi.post("/create", async (req, res) => {
    if (!req.body.name)
        return sendError(res, "No room name provided", "ROOM_NAME_MISSING");

    let roomData = {
        name: req.body.name,
        size: ""
    };

    if (req.body.size)
        roomData.size = req.body.size;

    if (req.body.description)
        roomData.description = req.body.description;

    try {
        await Room.create(roomData);
        return sendSuccess(res, "New room sucessfully created", "ROOM_CREATION_SUCCESS");
    } catch (error) {
        console.error(error);
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }
});

adminRoomApi.post("/delete", async (req, res) => {
    if (!req.body.roomID)
        return sendError(res, "No room ID provided", "ROOM_ID_MISSING");

    try {
        await Room.destroy({
            where: {
                id: req.body.roomID
            }
        });
        sendSuccess(res, "Room sucessfully deleted", "ROOM_DELETION_SUCCESS");
    } catch (error) {
        sendError(res, "Error encountred while deleting room", "ROOM_DELETION_ERROR");
    }
});

// TODO add image to room

adminRoomApi.post("/price/add", async (req, res) => {
    if (!req.body.roomID)
        return sendError(res, "No room ID provided", "ROOM_ID_MISSING");

    if (!req.body.duration)
        return sendError(res, "No duration provided", "ROOM_DURATION_MISSING");

    if (!req.body.price)
        return sendError(res, "No price provided", "ROOM_PRICE_MISSING");

    try {
        let room = await Room.findByPk(req.body.roomID);
        if (!room)
            sendError(res, "Room not found", "ROOM_NOT_FOUND");

        await RoomPrice.create({
            price: req.body.price,
            duration: req.body.duration,
            RoomId: room.id
        });
        sendSuccess(res, "New price sucessfully added", "ROOM_PRICE_ADD_SUCCESS");
    } catch (error) {
        sendError(res, "Error encountred while adding price to room", "ROOM_PRICE_ADD_ERROR");
    }
});

adminRoomApi.post('/calendar', async (req, res) => {
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
        if (req.body.users) {

            where.Therapist = {};
            where.Therapist.firstname = {
                [Op.in]: JSON.parse(req.body.users).map(e => e.split(" ")).flat(1)
            }
        }
    } catch (error) {}
    try {
        let rooms = await RoomReservations.findAll({
            where: where,
            attributes: ["id", "start", "end", "RoomId"],
            include: [
                {
                    model: Room,
                    attributes: ["name"]
                },
                {
                    model: Therapist,
                    attributes: ["firstname", "lastname"]
                }
            ]
        });
        return res.status(200).json(rooms.map(r => { return { ...r.dataValues, title: r.dataValues.Room.name } })).end();
    } catch (error) { }
    return sendError(res, "Error encountred while fetching rooms reservations.", "ROOM_RESERVATIONS_DATA_ERROR");
});