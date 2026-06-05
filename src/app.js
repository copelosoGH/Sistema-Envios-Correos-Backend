import express from 'express';
import cors from 'cors';
import articuloRoutes from './routes/articuloRoutes.js';

const app = express();

app.use(cors());

// Recibe el body como texto plano y corrige ceros adelante antes de parsear
app.use(express.text({ type: 'application/json' }));

app.use((req, res, next) => {
    if (req.body) {
        const corregido = req.body.replace(/:0+(\d+)/g, ':$1');
        req.body = JSON.parse(corregido);
    }
    next();
});

// Rutas
app.use('/api', articuloRoutes);

export default app;