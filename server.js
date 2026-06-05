import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 7013;

app.listen(PORT, () => {
    console.log(` Servidor en: http://localhost:${PORT}`);
});