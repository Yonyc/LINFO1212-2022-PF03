import { Router } from "express";
import { checkUserTherapist, isAdmin, isUserTherapist, sendError } from "../api/functions.js";
import { adminPagesRouter } from "./adminPages.js";
import { Therapist, User } from "./database.js";
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
    if (req.query.content)
        return res.status(200).render(path, {args: args});
    if (req.query.infos)
        return res.status(200).json({title: title}).end();

    res.render("partials/template", {title: title, path: "../" + path, args: args });
}

pagesRouter.use("/profile", async (req, res) => {
    renderTemplate(req, res, "pages/profile", "CT - profile", {});
});

pagesRouter.use("/therapist/:id(\\d+)", async (req, res) => {
    try {
        let therapists = await Therapist.findAll({
            where: { 
                approved: true,
                id: req.params.id
            },
            attributes: ["id", "description"],
            include: [
                {
                    model: User,
                    attributes: ["firstname", "lastname", "username", "url_pp"]
                }
            ]
        });
        if (therapists.length != 1) return sendError(res, "Le thérapeute n'existe pas.", "THERAPIST_NOT_EXIST");
        let therapist = therapists[0];
        return renderTemplate(req, res, "pages/therapist_presentation", `CT - ${therapist.User.username}`, {therapist: therapist});
    } catch (error) {
        return sendError(res, "Une erreur innatendue est survenue.", "UNEXPECTED_ERROR");
    }
});

pagesRouter.use("/therapist", async (req, res) => {
    if (!await checkUserTherapist(req, res)) return false;
    renderTemplate(req, res, "pages/therapist", "Mon espace", {});
});

pagesRouter.use("/booking", async (req, res) => {
    if (!(await isUserTherapist(req) || await isAdmin(req))) return sendError(res, "Vous devez être thérapeute pour accéder à cette resource.", "USER_NOT_THERAPIST", 401);
    renderTemplate(req, res, "pages/booking", "Réservation", {});
});

pagesRouter.use("/appointment", (req, res) => {
    renderTemplate(req, res, "pages/appointment", "CT - Rendez-vous", {});
});

pagesRouter.use("/admin", adminPagesRouter);

pagesRouter.use("/", (req, res) => {
    renderTemplate(req, res, "pages/index", "Centre tremplin", {});
});