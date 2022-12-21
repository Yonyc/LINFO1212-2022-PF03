import { Router } from "express";
import { Room, RoomReservations } from '../modules/database.js'
import { sendCustomSuccess, sendError, sendSuccess } from "./functions.js";
import { Op } from "sequelize";
import { checkUserTherapist, getTherapist } from "./functions.js";

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

roomApi.post("/book", async (req, res) => {
    if (!checkUserTherapist(req, res)) return false;

    if (!req.body.room) return sendError(res, "Erreur, aucune salle sélectionnée.", "ROOM_NOT_SELECTED");
    if (!req.body.date) return sendError(res, "Erreur, aucune date sélectionnée.", "ROOM_DATE_NOT_SELECTED");
    if (!req.body.duration) return sendError(res, "Erreur, aucune durée sélectionnée.", "ROOM_DURATION_NOT_SELECTED");
    if (!req.body.reccurence) return sendError(res, "Erreur, aucune réccurence sélectionnée.", "ROOM_RECCURENCE_NOT_SELECTED");
    if (!req.body.end_reccurence) return sendError(res, "Erreur, aucune fin de réccurence spécifiée.", "ROOM_ENDRECCURENCE_NOT_SELECTED");

    let start;
    try {
        start = new Date(req.body.date);
    } catch (error) {
        return sendError(res, "Erreur lors de la conversion de la date.", "DATE_FORMAT_ERROR");
    }

    if (start < new Date()) return sendError(res, "La date de la réservation ne peut être antérieure à maintenant.", "ROOM_RESERVATION_TOO_SOON");

    if (start.getHours() < 7) return sendError(res, "L'heure de la réservation ne peut pas être avant 7h.", "ROOM_RESERVATION_TOO_EARLY");

    let end;
    try {
        if (req.body.duration <= .5) return sendError(res, "Impossible de réserver une plage si peu étendue.", "ROOM_RESERVATION_TOO_SHORT");
        if (req.body.duration > 4) return sendError(res, "Impossible de réserver une plage si étendue.", "ROOM_RESERVATION_TOO_LONG");
        end = new Date(start + req.body.duration*60*60*1000);
    } catch (error) {
        return sendError(res, "Erreur lors de la conversion de la date de fin.", "DATE_FORMAT_ERROR");
    }

    if (end.getHours() > 23) return sendError(res, "La fin de la réservation ne peut pas dépasser 23h.", "ROOM_RESERVATION_TOO_LATE");

    try {
        let roomReservations = await RoomReservations.findAll({
            where: {
                RoomId: req.body.room,
                end: {
                    [Op.gte]: start
                },
                start: {
                    [Op.lte]: start
                }
            }
        });
        if (roomReservations) return sendError(res, "Ce créneau est déjà réservé pour cette salle.", "ROOM_ALREADY_BOOKED");

        let therapist = await getTherapist(req);

        await RoomReservations.create({
            RoomId: req.body.room,
            end: end,
            start: start,
            TherapistId: therapist.id
        });
        sendSuccess(res);
    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }
});