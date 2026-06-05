import { Router } from 'express';
import { enviarCorreoDinamico } from '../controllers/emailController.js';

const router = Router();

router.post('/enviarCorreo2', enviarCorreoDinamico);
router.get('/test', (req, res) => {
  res.json({ message: 'API de envío de artículos funcionando correctamente.' });
});

export default router;