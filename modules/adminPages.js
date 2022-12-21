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

adminPagesRouter.use("/therapists", (req, res) => {
    renderTemplate(req, res, "admin/therapists", "CT - Therapists Demands");
});

adminPagesRouter.use("/users", (req, res) => {
    
});

adminPagesRouter.use("/reservations", (req, res) => {
    
});