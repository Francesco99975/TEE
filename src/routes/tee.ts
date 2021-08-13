import { Router } from "express";
import { onEncrypt, onDecrypt } from "../controllers/tee";

const router = Router();

router.post('/encrypt', onEncrypt);
router.post('/decrypt', onDecrypt);

export default router;
