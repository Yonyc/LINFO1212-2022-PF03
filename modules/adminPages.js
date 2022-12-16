import { Router } from "express";

export const adminPagesRouter = new Router();

function renderTemplate(req, res, path="", title="", args={}) {
    if (req.query.content) {
        res.render(path, args);
        return;
    }
    if (req.query.infos) {
        res.json({title: title});
        return;
    }

    res.render("partials/template", {title: title, path: "../" + path, args: args });
}

adminPagesRouter.use("/", (req, res, next) => {
    if (!req.user || !req.user.admin) {
        res.status(401).send("You are not administrator");
        res.end();
        return;
    }
    next();
});

adminPagesRouter.use("/therapist_demands", (req, res) => {
    renderTemplate(req, res, "admin/therapist_demands", "CT - Therapists Demands");
});

adminPagesRouter.use("/users", (req, res) => {
    
});

adminPagesRouter.use("/reservations", (req, res) => {
    
});