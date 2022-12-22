import { Therapist, UserRoles } from "../modules/database.js";

export function isUserLogged(req) {
    return req.user && req.user.id;
}

export function checkUserLogged(req, res) {
    if (!isUserLogged(req)) {
        sendError(res, "User loggin required.", "USER_NOT_LOGGED", 401);
        return false;
    }
    return true;
}

export async function isUserTherapist(req) {
    if (!isUserLogged(req)) return false;

    try {
        let therapist = await Therapist.findAll({
            where: {
                UserId: req.user.id
            }
        });
        if (therapist) 
            return true;
    } catch (error) {}

    return false;
    
}

export async function checkUserTherapist(req, res) {
    if (!checkUserLogged(req, res)) return false;
    if (!(await isUserTherapist(req))) {
        sendError(res, "You need to be a therapist to access this ressource", "USER_NOT_THERAPIST");
        return false;
    }
    return true
}

export async function getTherapist(req) {
    try {
        let therapist = await Therapist.findAll({
            where: {
                UserId: req.user.id
            }
        });
        return therapist[0];
    } catch (error) {}
}

export async function isAdmin(req) {
    let roles = await UserRoles.findAll({ where: { UserId: req?.user.id } });
    for (let i = 0; i < roles.length; i++)
        if (roles[i].RoleId == 1)
            return true;
    return false;
}

export function sendCustomError(res, data, suppData = {}, http_code = 200) {
    return res.status(http_code).json({
        success: false,
        data: data,
        ...suppData
    }).end();
}

export function sendError(res, message, code, http_code = 200) {
    return sendCustomError(res, {
        message: message,
        code: code
    }, null, http_code);
}

export function sendCustomSuccess(res, data, suppData = {}, http_code = 200) {
    return res.status(http_code).json({
        success: true,
        data: data,
        ...suppData
    }).end();
}

export function sendSuccess(res, message, code, http_code = 200) {
    return sendCustomSuccess(res, {
        message: message,
        code: code
    }, null, http_code);
}