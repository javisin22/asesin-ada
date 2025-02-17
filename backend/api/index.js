const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');
const routes = require('./routes.js');
const cors = require('cors');
// const pool = require("./connectionManager");
require('dotenv').config();

const constants = require('./constants.js');
const socketio = require('./socket.js');

const { moveBot, moveBotTest, updateCard, updateCardTest, createBot, printCard } = require('../bot/bot.js');

//connection to database
// pool.connect();

//mode
let ips2listen = [];
if (process.env.NODE_ENV === 'production') {
  ips2listen = constants.PRODUCTION_IPS;
} else {
  ips2listen = constants.DEVELOPMENT_IPS;
}
//ips2listen = [constants.DEVELOPMENT_IP_1, constants.DEVELOPMENT_IP_2]

console.log('Listening in : [ ' + ips2listen + ' ]');
console.log('Running in ' + process.env.NODE_ENV + ' mode');

/*////////////////////
ZONA DE PRUEBAS DE BOT
*/////////////////////

// index del bot para crearlo
// let numBot = 3;
// let card1 = constants.ROOMS_NAMES[0];
// let card2 = constants.CHARACTERS_NAMES[0];
// let card3 = constants.ROOMS_NAMES[6];
// let cards = [card1, card2, card3]; 

// const tarjeta = createBot(numBot, cards);
// console.log(tarjeta);
// updateCardTest(tarjeta)
//   .then((res) => {
//     return moveBotTest(res);
//   })
//   .then(() => {
//     // Esta parte del código se ejecutará después de que otraFuncionSecuencial haya terminado
//     console.log('Tests de los bots terminados.');
//   })
//   .catch(error => {
//     console.error('Hubo un error:', error);
//   });

/////////////////////////////
// LLAMADA A FUNCIONES REALES
// index del bot para crearlo
// let id_bot = 3;
// let card1 = constants.ROOMS_NAMES[0];
// let card2 = constants.CHARACTERS_NAMES[0];
// let card3 = constants.ROOMS_NAMES[6];
// let cards = [card1, card2, card3]; 

// const tarjeta = createBot(id_bot, cards);

// let lvl = 3;
// let asker = 2;
// let holder = 1;
// let pjs_pos = [40, 295, 394, 223, 183, 371];
// let dice = 9;
// updateCard(id_bot, lvl, asker, holder, 'biblioteca', 'miss REDES', 'troyano', 0, tarjeta)
//   .then((res) => {
//     printCard(res);
//     moveBot(pjs_pos, id_bot, dice, res)
//     .then((res) => {
//       console.log(res.toString());
//     })
//     .catch(error => {
//       console.error('Hubo un error:', error);
//     });
//   })
//   .then(() => {
//     // Esta parte del código se ejecutará después de que otraFuncionSecuencial haya terminado
//     console.log('Funciones de bots terminadas.');
//   })
//   .catch(error => {
//     console.error('Hubo un error:', error);
//   });
/*////////////////////
FIN ZONA DE PRUEBAS DE BOT
*/////////////////////

const app = express();
app.use(cors());

// Routes
app.use('/', routes);

// Middleware para habilitar CORS
app.use((req, res, next) => {
  const allowedOrigins = ips2listen;
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header(constants.ALLOW_ORIGIN, origin);
  } else return res.status(403).json({ error: 'Origin not allowed' });

  res.header(constants.ALLOW_METHODS, constants.METHODS);
  res.header(constants.ALLOW_HEADERS, constants.HEADERS);
  next();
});

const port = constants.PORT;
const server = createServer(app);

server.listen(port, () => {
  console.log(`${constants.SERVER_TXT} ${port}`);
});

//
const io = new Server(server, {
  cors: {
    origin: ips2listen,
  },
});
socketio.runSocketServer(io);
