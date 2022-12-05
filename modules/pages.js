import { Router } from "express";

const pagesRouter = new Router();

function renderTemplate(req, res, path="", title="", args={}) {
    if (req.query.content) {
        res.render(path, args);
        return;
    }
    if (req.query.infos) {
        res.json({title: title});
        return;
    }
    res.render('partials/template', {title: title, path: "../" + path, args: args });
}

pagesRouter.use("/profile", (req, res) => {
    renderTemplate(req, res, "pages/profile", "CT - profil", {});
});

pagesRouter.use("/therapist", (req, res) => {});

pagesRouter.use("/reservation", (req, res) => {});

pagesRouter.use("/appointment", (req, res) => {});

pagesRouter.use("/", (req, res) => {
    renderTemplate(req, res, "pages/index", "Centre tremplin", {});
});

export default pagesRouter;