import { Router } from "express";
import { adminPagesRouter } from "./adminPages.js";
import { User } from "./database.js";
import { renderCSS } from "./scss.js";

export const pagesRouter = new Router();

pagesRouter.use("/", async (req, res, next)=>{
    await renderCSS();
    next();
});

export async function renderTemplate(req, res, path="", title="", args={}) {
    if (req.user) {
        let user = await User.findByPk(req.user.id, {
            attributes: ["username", "firstname", "lastname", "email", "phone", "mobilephone", "address", "url_pp"]
        });
        args.user = user.dataValues;
    }
    if (req.query.content) {
        res.render(path, {args: args});
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
    renderTemplate(req, res, "pages/profile", "CT - profile", {args: args});
});

pagesRouter.use("/therapist", (req, res) => {
    renderTemplate(req, res, "pages/therapist", "Mon espace", {});
});

pagesRouter.use("/booking", (req, res) => {
    renderTemplate(req, res, "pages/booking", "Réservation", {});
});

pagesRouter.use("/appointment", (req, res) => {});

pagesRouter.use("/admin", adminPagesRouter);

pagesRouter.use("/", (req, res) => {
    renderTemplate(req, res, "pages/index", "Centre tremplin", {});
});