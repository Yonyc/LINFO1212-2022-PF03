import { Router } from "express";
import { renderCSS } from "./scss.js";
import passport from 'passport'

export const pagesRouter = new Router();

pagesRouter.use(passport.initialize());
pagesRouter.use(passport.session());

pagesRouter.use("/", async (req, res, next)=>{
    await renderCSS();
    next();
});

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
    if (req.isAuthenticated()) {
        renderTemplate(req, res, "pages/profile", "CT - profile", {suser: req.user});
    } else {
        renderTemplate(req, res, "pages/profile", "CT - profile", {});
    }
});

pagesRouter.use("/therapist", (req, res) => {});

pagesRouter.use("/reservation", (req, res) => {});

pagesRouter.use("/appointment", (req, res) => {});

pagesRouter.use("/", (req, res) => {
    renderTemplate(req, res, "pages/index", "Centre tremplin", {});
});