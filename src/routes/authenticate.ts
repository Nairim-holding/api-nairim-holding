import express from 'express'
import { AuthenticateController } from '../controllers/authenticateController';

const router = express.Router();

router.post('/authenticate', AuthenticateController.login);

export default router;