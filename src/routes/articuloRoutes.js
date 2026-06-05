import { Router } from 'express';
import { enviarArticulos } from '../controllers/emailController.js';

const router = Router();

router.post('/enviarCorreo', enviarArticulos);
router.get('/test', (req, res) => {
  res.json({ message: 'API de envío de artículos funcionando correctamente.' });
});

export default router;