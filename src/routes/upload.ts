import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute } from "./route";
import * as express from "express";
import * as fs from "fs";
import * as util from "util";
import * as uuid from "uuid/v4";
import * as path from "path";
import * as jo from "jpeg-autorotate";


/**
 * / route
 *
 * @class User
 */
export class UploadRoute extends BaseRoute {

    public static create(router: Router) {
        //log
        console.log("Creating upload route...");

        //add home page route
        router.post("/rotate", (req: Request, res: Response, next: NextFunction) => {
            new UploadRoute().rotate(req, res, next);
        });
    }

    /**
     * Constructor
     *
     * @class IndexRoute
     * @constructor
     */
    constructor() {
        super();
    }

    public rotate(req: Request, res: Response, next: NextFunction) {
        //set message
        if (!req["files"]) {
            fs.writeFileSync('./data.json', util.inspect(req), 'utf-8');
            return res.status(400).send("No files uploaded!");
        }

        const filename = uuid() + ".jpg";
        const imgKey: string = path.join("img", filename);
        const imgKeyRotation: string = path.join("img", "rotated_" + filename);
        console.log(imgKey);
        const output = path.join("public", imgKey);
        const outputRotation = path.join("public", imgKeyRotation);
        const sampleFile = req["files"]["sampleFile"];
        sampleFile.mv(output, (err) => {
            if (err) return res.status(500).send(err);
            jo.rotate(output, { "quality": 85 }, (err, buf, orientation) => {
                console.log(output)
                console.log(orientation);
                console.log(buf);
                const ws = fs.createWriteStream(outputRotation, {
                    autoClose: true
                });
                ws.write(buf, () => {
                    let options: Object = {
                        "title": "You image uploaded.",
                        "img1": imgKey,
                        "img2": imgKeyRotation,
                    };
                    this.render(req, res, "transformed", options);
                });
            })
        })



    }
}