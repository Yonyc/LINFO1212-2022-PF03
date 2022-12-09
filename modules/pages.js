import { Router } from "express";
import { User } from "./database.js";
import { renderCSS } from "./scss.js";

export const pagesRouter = new Router();

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

    res.render("partials/template", {title: title, path: "../" + path, args: args });
}

pagesRouter.use("/profile", async (req, res) => {
    let args = {};
    if (req.user) {
        let user = await User.findByPk(req.user.id, {
            attributes: ["username", "firstname", "lastname", "email", "phone", "mobilephone", "address", "url_pp"]
        });
        args.user = user.dataValues;
    }
    renderTemplate(req, res, "pages/profile", "CT - profile", {args: args});
});

pagesRouter.use("/therapist", (req, res) => {});

pagesRouter.use("/reservation", (req, res) => {});

pagesRouter.use("/appointment", (req, res) => {});

pagesRouter.use("/", (req, res) => {
    renderTemplate(req, res, "pages/index", "Centre tremplin", {});
});