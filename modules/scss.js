import { writeFile } from "fs";
import { render } from "node-sass";

export async function renderCSS() {
    await render({
        file: "./public/css/style.scss",
        outFile: "./public/css/style.css",
        outputStyle: "expanded"
    }, function (error, result) { // node-style callback from v3.0.0 onwards
        if (error) {
            console.error(error);
            return;
        }
        // No errors during the compilation, write this result on the disk
        writeFile("./public/css/style.css", result.css, function (err) {
            if (err) {
                console.error(err);
            }
        });
    });
}