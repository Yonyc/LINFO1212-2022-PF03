import { Router } from "express";

export const adminPagesRouter = new Router();

adminPagesRouter.use("/", (req, res, next) => {
    if (!req.user || !req.user.admin) {
        res.status(401);
        res.end();
        return;
    }
    next();
});

adminPagesRouter.use("/therapist_demands", (req, res) => {
    
});

adminPagesRouter.use("/users", (req, res) => {
    
});

adminPagesRouter.use("/reservations", (req, res) => {
    
});