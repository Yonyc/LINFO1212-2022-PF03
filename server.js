import {renderCSS} from "./modules/scss.js";
import * as db from "./modules/database.js";
import {pagesRouter} from "./modules/pages.js";
import session from "express-session";
import express from "express";
import bodyParser from "body-parser";
import { api } from "./api/api.js";
import passport from "passport";

renderCSS();
const app = express();
const port = 3000;

// Using ejs as render engine
app.set('view engine', 'ejs');

// Using post method
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Starting session 
app.use(session({
    secret: 'centretremplin',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 * 24 * 5 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));

app.use("/api", api);

app.use(pagesRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})