import { Router } from "express";

const pagesRouter = new Router();

pagesRouter.use("/", (req, res) => {
    res.render('partials/template', {title: "Centre tremplin", path: "../pages/index", args: {} });
});

export default pagesRouter;