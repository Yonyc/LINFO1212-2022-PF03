import { Router } from "express";
import { Therapist, User, UserRoles } from "../modules/database.js";

export const adminApi = new Router();

async function isAdmin(req) {
    let roles = await UserRoles.findAll({where: {UserId: req.user.id}});
    roles.forEach(element => {
        if (element.RoleId == 1) {
            return true;
        }
    });

    return false;
}

adminApi.use("/", async (req, res, next) => {
    if (!req.user || !isAdmin(req)) {
        console.lg
        res.status(401);
        res.end();
        return;
    }
    next();
});

adminApi.post("/therapist_approvals", async (req, res) => {
    res.status(200).json({
        success: true,
        therapists: await Therapist.findAll({
            where: {
                approved: false,
                rejected: false
            },
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: ["firstname", "lastname"]
                }
            ]
        })
    });
});

adminApi.post("/promote", async (req, res) => {
    if (!req.body.therapist) {
        res.status(400).end();
        return;
    }
    let therapist = await Therapist.findByPk(req.body.therapist);
    if (!therapist) {
        res.status(304).end();
        return;
    }
    therapist.approved = true;
    await therapist.save();

    res.status(200).end();
});

adminApi.post("/refuse", async (req, res) => {
    if (!req.body.therapist) {
        res.status(400).end();
        return;
    }
    let therapist = await Therapist.findByPk(req.body.therapist);
    if (!therapist) {
        res.status(304).end();
        return;
    }
    therapist.rejected = true;
    await therapist.save();

    res.status(200).end();
});