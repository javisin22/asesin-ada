import { infoHabitaciones, infoTablero } from '../../front-end-shared/infoTablero.js';
import fs from 'fs';

// Exportar la variable como JSON
fs.writeFileSync('infoHabitaciones.json', JSON.stringify(infoHabitaciones));
fs.writeFileSync('infoTablero.json', JSON.stringify(infoTablero));
