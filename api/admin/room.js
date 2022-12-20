import { Router } from "express";
import { Room, RoomPrice } from "../../modules/database.js";
import { sendError, sendSuccess } from "../api.js";

export const adminRoomApi = new Router();

adminRoomApi.post("/create", async (req, res) => {
    if (!req.body.roomName)
        return sendError(res, "No room name provided", "ROOM_NAME_MISSING");

    let roomData = { name: req.body.roomName };

    if (req.body.roomSize)
        roomData.size = req.body.roomSize;

    if (req.body.roomDescription)
        roomData.description = req.body.roomDescription;

    try {
        await Room.create(roomData);
        sendSuccess(res, "New room sucessfully created", "ROOM_CREATION_SUCCESS");
    } catch (error) {
        sendError(res, "Error encountred while creating new room", "ROOM_CREATION_ERROR");
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