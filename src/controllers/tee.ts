import { Request, Response, NextFunction } from "express";
import { encrypt, decrypt, checkData, checkKey } from "../helpers/encryption";

export async function onEncrypt(req: Request, res: Response, next: NextFunction) {
    try {
        await checkData(req.body.data);

        let response = {};

        if(req.body.key && req.body.key.length > 0) {
            await checkKey(req.body.key);

            for (const key in req.body.data) {
                response = {...response, [key]: await encrypt(req.body.data[key], req.body.key)};
            }
        } else {
            for (const key in req.body.data) {
                response = {...response, [key]: await encrypt(req.body.data[key])};
            }
        }

        return res.json(response);
    } catch (error) {
        next(error);
    }
}

export async function onDecrypt(req: Request, res: Response, next: NextFunction) {
    try {
        let response = {};

        if(req.body.key && req.body.key.length > 0) {
            for (const key in req.body.data) {
                response = {...response, [key]: await decrypt(req.body.data[key], req.body.key)};
            }
        } else {
            for (const key in req.body.data) {
                response = {...response, [key]: await decrypt(req.body.data[key])};
            }
        }    

        return res.json(response);
    } catch (error) {
        next(error);
    }
}