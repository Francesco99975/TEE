import { Request, Response, NextFunction } from "express";
import { encrypt, decrypt, checkData } from "../helpers/encryption";

export async function onEncrypt(req: Request, res: Response, next: NextFunction) {
    await checkData(req.body);

    let response = {};

    for (const key in req.body) {
        response = {...response, [key]: await encrypt(req.body[key])};
    }

    return res.json(response);
}

export async function onDecrypt(req: Request, res: Response, next: NextFunction) {
    let response = {};

    for (const key in req.body) {
        response = {...response, [key]: await decrypt(req.body[key])};
    }

    return res.json(response);
}