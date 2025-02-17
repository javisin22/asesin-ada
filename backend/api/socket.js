const constants = require('./constants.js');
const controller = require('./controller.js');
const game = require('./game.js');

function obtenerFechaActual() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = (constants.CERO + (fecha.getMonth() + 1)).slice(-2);
  const dia = (constants.CERO + fecha.getDate()).slice(-2);
  const hora = (constants.CERO + fecha.getHours()).slice(-2);
  const minutos = (constants.CERO + fecha.getMinutes()).slice(-2);
  const segundos = (constants.CERO + fecha.getSeconds()).slice(-2);
  const milisegundos = (constants.CERO + fecha.getMilliseconds()).slice(-6); // Limitar a tres dígitos de precisión
  const zonaHorariaOffset = fecha.getTimezoneOffset();
  const signoZonaHoraria =
    zonaHorariaOffset > 0 ? constants.MENOS : constants.MAS;
  const horasZonaHoraria = (
    '0' + Math.abs(fecha.getTimezoneOffset() / 60)
  ).slice(-2);

  return `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}.${milisegundos}${signoZonaHoraria}${horasZonaHoraria}`;
  //"2024-03-14 12:54:56.419369+00"
}

function formattedDate(date) {
  const oldDate = new Date(date);
  const currentDate = new Date();

  // Check if oldDate and currentDate are on the same day
  if (
    oldDate.getDate() === currentDate.getDate() &&
    oldDate.getMonth() === currentDate.getMonth() &&
    oldDate.getFullYear() === currentDate.getFullYear()
  ) {
    // Format the parts of the time to have two digits (add zeros to the left if necessary)
    const hours = ('0' + oldDate.getHours()).slice(-2);
    const minutes = ('0' + oldDate.getMinutes()).slice(-2);

    // Create a string with the formatted parts of the time
    const newDate = hours + ':' + minutes; /* + ':' + seconds */

    return newDate;
  } else {
    // Calculate the difference in days
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((currentDate - oldDate) / oneDay));

    return diffDays === 1 ? 'ayer' : 'hace ' + diffDays + ' días';
  }
}
async function storeMsg(currentTimestamp, group, isQ, msg, emisor) {
  try {
    const msgSaved = await controller.saveMsg(
      currentTimestamp,
      group,
      isQ,
      msg,
      emisor
    );
    console.log(msgSaved.msg);
  } catch (error) {
    console.error(constants.ERROR_STORE_MSG, error);
  }
}

async function ldrMsg(socket) {
  if (!socket.recovered) {
    try {
      const offset = socket.handshake.auth.offset;
      const group = socket.handshake.auth.group;
      const result = await controller.restoreMsg(offset, group);
      let chatDate;

      result.mensajes?.map(({ emisor, mensaje, instante }) => {
        chatDate = formattedDate(instante);
        socket.emit(constants.CHAT_RESPONSE, emisor, mensaje, offset, chatDate);
      });
    } catch (error) {
      console.error(constants.ERROR_LOAD_MSG, error);
    }
  }
}

const addSocketToGroup = (socket) => {
  // const username = socket.handshake.auth.username;
  const group = socket.handshake.auth.group;
  socket.join(group);
};

function runSocketServer(io) {
  io.on(constants.CONNECT, async(socket) => {

    console.log("se ha conectado a SOCKET.JS " + socket.handshake.auth.username + " en la sala " + socket.handshake.auth.group);
    addSocketToGroup(socket);
    // añadir usuario a la partida en la DB (partida_actual)
    
    await controller.joinGame(socket.handshake.auth.username, socket.handshake.auth.group);    

    // INFO DE JUEGO --> mandar incondicionalmente la información sin necesidad de esperar a request-game-info
    // socket.on('request-game-info', async() => {
    const {areAvailable:areAvailable1} = await controller.availabilityCharacters(socket.handshake.auth.group);
    console.log("areAvailable1: ", areAvailable1);

    const res = await controller.getPlayerStateInformation(socket.handshake.auth.group, socket.handshake.auth.username);

    // const sos = Array(28).fill('');
    // sos[10] = Array(7).fill(2);

    console.log("res.sospechas: ", res.sospechas);

    io.to(socket.handshake.auth.group).emit('game-info', {
      names: constants.CHARACTERS_NAMES,
      guns: constants.GUNS_NAMES,
      rooms: constants.ROOMS_NAMES,
      available: areAvailable1,

      cards: res.cards,
      sospechas: res.sospechas,
      posiciones: res.positions,
      turnoOwner: res.turnoOwner,   
    });
    // });
    
    
    socket.on('disconnect', async () => {
      console.log(constants.USER_DISCONNECTED);
      socket.disconnect();
    });

    socket.on('leave-game', async() => {
      console.log(constants.USER_DISCONNECTED + socket.handshake.auth.username);
      
      await controller.leaveGame(socket.handshake.auth.username);
      const { areAvailable: areAvailable2} = await controller.availabilityCharacters(socket.handshake.auth.group);
      
      io.to(socket.handshake.auth.group).emit('game-info', {
        names: constants.CHARACTERS_NAMES,
        guns: constants.GUNS_NAMES,
        rooms: constants.ROOMS_NAMES,
        available: areAvailable2,
      });
      
      socket.disconnect();
    });



    socket.on('character-selected', async (character) => {
      // console.log('character-selected: ', character);
      const index = constants.CHARACTERS_NAMES.indexOf(character);
      const { areAvailable: areAvailable3} = await controller.availabilityCharacters(socket.handshake.auth.group);
      areAvailable3[index] = socket.handshake.auth.username;

      await controller.selectCharacter(socket.handshake.auth.username, character);

      io.to(socket.handshake.auth.group).emit('game-info', {
        names: constants.CHARACTERS_NAMES,
        guns: constants.GUNS_NAMES,
        rooms: constants.ROOMS_NAMES,
        available: areAvailable3,
      });
    });

    // CHAT
    socket.on(constants.CHAT_MESSAGE, async(msg) => {
      const emisor = socket.handshake.auth.username;
      const currentTimestamp = obtenerFechaActual();
      const date = formattedDate(currentTimestamp);

      io.to(socket.handshake.auth.group).emit(
        constants.CHAT_RESPONSE,
        emisor,
        msg,
        currentTimestamp,
        date
      );

      const group = socket.handshake.auth.group;
      const isQ = constants.STOP;
      await storeMsg(currentTimestamp, group, isQ, msg, emisor);
    });


    // LÓGICA DE PARTIDA
    socket.on('start-game', async() => {
      console.log('start game received');
      game.runGame(io, socket.handshake.auth.group);
    });

    socket.on('response-sospechas', async (sospechas) => {
      // console.log('response-sospechas: ', sospechas);
      await controller.update_players_info(socket.handshake.auth.username, sospechas, null);
    });

    ldrMsg(socket);
  });
}

module.exports = {
  runSocketServer,
};
