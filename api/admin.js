import { Router } from "express";
import { Therapist, User } from "../modules/database.js";

export const adminApi = new Router();

adminApi.use("/", (req, res, next) => {
    if (!req.user || !req.user.admin) {
        res.status(401);
        res.end();
        return;
    }
    next();
});

adminApi.post("/therapist_approvals", async (req, res) => {
    res.status(200).json(await Therapist.findAll({
        where: {
            approved: false
        },
        include: [
            {
                model: User,
                as: "User",
                attributes: ["firstname", "lastname"]
            }
        ]
    }));
});