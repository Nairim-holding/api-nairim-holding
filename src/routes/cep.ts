import { Router } from 'express';
import { CepController } from '../controllers/cepController';

const router = Router();

router.get('/cep/:cep', CepController.getCep);

export default router;
