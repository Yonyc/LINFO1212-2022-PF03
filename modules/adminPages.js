import { Router } from "express";
import { sendError } from "../api/api.js";
import { UserRoles } from "./database.js";
import { renderTemplate } from "./pages.js";

export const adminPagesRouter = new Router();

async function isAdmin(req) {
    let roles = await UserRoles.findAll({ where: { UserId: req?.user.id } });
    for (let i = 0; i < roles.length; i++)
        if (roles[i].RoleId == 1)
            return true;
    return false;
}

adminPagesRouter.use("/", async (req, res, next) => {
    if (!req.user || !(await isAdmin(req))) {
        return res.status(401).send("You are not administrator").end();
    }
    next();
});

adminPagesRouter.use("/panel", (req, res) => {
    renderTemplate(req, res, "admin/panel", "CT - Panel Admin");
});

adminPagesRouter.use("/home", (req, res) => {
    renderTemplate(req, res, "admin/home", "CT - Panel Admin");
});

adminPagesRouter.use("/therapists", (req, res) => {
    renderTemplate(req, res, "admin/therapists", "CT - Therapists Demands");
});

adminPagesRouter.use("/rooms", (req, res) => {
    renderTemplate(req, res, "admin/rooms", "CT - Admin - Rooms Managment");
});

adminPagesRouter.use("/users", (req, res) => {
    
});

adminPagesRouter.use("/reservations", (req, res) => {
    
});