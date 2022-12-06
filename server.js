import {renderCSS} from "./modules/scss.js";
import * as db from "./modules/database.js";
import pagesRouter from "./modules/pages.js";

import express from "express";
import session from "express-session";
import bodyParser from "body-parser";

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

app.use(express.static("public"));

app.use(pagesRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})