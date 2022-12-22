import { Router } from "express";
import { isAdmin, sendError } from "../api/functions.js";
import { renderTemplate } from "./pages.js";

export const adminPagesRouter = new Router();

adminPagesRouter.use("/", async (req, res, next) => {
    if (!req.user || !(await isAdmin(req))) {
        return sendError(res, "Vous devez être administrateur pour accéder à cette ressource.", "PERMISSION_ADMIN", 401);
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