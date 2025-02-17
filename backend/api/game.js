const constants = require('./constants');
const { moveBot, updateCard , createBot, printCard} = require('../bot/bot');
const controller = require('./controller.js');

//orden de turnos: mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA
//posicion inicial asociada al personaje

// global para hacer efectivos los cambios en todas las funciones y métodos
let relaciones_socket_username = []

//declare a dictionary to store the players in order
let players_in_order = { };

// variable to store the pause state of the game and the io object
let game_info = { };

// function to manage the web sockets when the game is paused
const createEventListenersStopGame = (s, group) => {
  console.log("new socket connected during game:", s.socket_id);
  if (s.group !== group) return;
  console.log("NOT RETURNED");
  s.socket.on(constants.DISCONNECT, () => {
    console.log('socket desconectado:', s.socket_id);
    relaciones_socket_username = relaciones_socket_username.filter((sock) => sock.socket_id !== s.socket_id);
  });

  s.socket.on('request-pause-game', async () => {
    console.log('request-pause-game');
    game_info.group.pause = true;

    await controller.stopGame(group);
  });

  s.socket.on('request-resume-game', async () => {
    console.log('request-resume-game');
    const io = game_info.group.io;
    io.to(group).emit('game-resumed-response', {}); // 📩
    game_info.group.pause = false;

    await controller.resumeGame(group);

    handleNextTurn(group, -1, io);
  });
}  

async function gameWSMessagesListener(io, group) {
  io.on(constants.CONNECT, async (socket) => {

    console.log("se ha conectado a GAME.JS el socket:", socket.handshake.auth.username);

    // si el socket es de mi grupo lo meto en 'relaciones_socket_username'
    // sino, corto esta conexion (usuario conectado en otra partida)
    if (socket.handshake.auth.group != group) return;

    // añadir al usuario a 'relaciones_socket_username' si no está (en caso de re-conexión)
    if (relaciones_socket_username.some((s) => s.username === socket.handshake.auth.username)) {
      // se da si abres la partida con 2 navegadores (o 2 tecnologias)
      // quitar de relaciones_socket_username al previo y meter al nuevo
      const s = relaciones_socket_username.find((s) => s.username === socket.handshake.auth.username);      

      // console.log("socket antiguo:", s.socket_id);
      s.socket.emit('close-connection', {}); // 🎃 mensaje para echar al socket antiguo

      s.socket.disconnect();

      // enviar al nuevo socket la información actual para que recupere el estado
      socket.emit('game-info', {
        names: constants.CHARACTERS_NAMES,
        guns: constants.GUNS_NAMES,
        rooms: constants.ROOMS_NAMES,
        available: players_in_order.group.username,
      });

      // console.log("reconexion:", socket.id);
      relaciones_socket_username = relaciones_socket_username.filter((s) => s.username !== socket.handshake.auth.username)
    }
    // console.log("socket nuevo:", socket.id);
    const s = { socket_id: socket.id, socket: socket, username: socket.handshake.auth.username, io: io, group: group}; 
    relaciones_socket_username.push(s);
    // else: pertenezco a la partida ya empezada
    
    // lo meto en 'relaciones_socket_username' en la componente que toque
    // en funcion de su username (recuperar de la DB qu茅 character es en funci贸n de su username)

    createEventListenersStopGame(s, group);
    // cuando se desconecta, lo saco de 'relaciones_socket_username'
  });

  // io.on('request-pause-game', async () => {
  //   console.log('IO ON request-pause-game');
  //   game_info.group.pause = true;

  //   await controller.stopGame(group);
  // });

  // io.on('request-resume-game', async () => {
  //   console.log('IO ON request-resume-game');
  //   const io = game_info.group.io;
  //   io.to(group).emit('game-resumed-response', {}); // 📩
  //   game_info.group.pause = false;

  //   await controller.resumeGame(group);

  //   handleNextTurn(group, io);
  //   // handleNextTurn(group, io).catch(error => console.error(error));
  // });
  
  // const relaciones_socket_username_group = relaciones_socket_username.filter((s) => s.group === group);
  relaciones_socket_username.forEach((s) => {
    createEventListenersStopGame(s, group);
  });
}

// function that controls the game's state machine
async function runGame(io, group) {

  await controller.resumeGame(group);
  game_info.group = { pause: false, io: io};
  // Conseguir todos los sockets de los usuarios conectados al grupo
  const socketsSet = io.sockets.adapter.rooms.get(group);

  // Asociar a cada socket, el nombre de usuario del jugador correspondiente
  socketsSet.forEach((s) => {
    relaciones_socket_username.push({socket_id: s, socket:io.sockets.sockets.get(s), username: io.sockets.sockets.get(s).handshake.auth.username , group: group});
  });
  gameWSMessagesListener(io,group);
  
  //await controller.removeBots(group)

  // get players with their characters
  let { players } = await controller.getPlayersCharacter(group);

  //charcters available has all the characters that are not selected by any player
  const characters = [constants.SOPER, constants.REDES, constants.PROG, constants.FISICA, constants.DISCRETO, constants.IA];
  let charactersAvailable = characters.filter((character) => !players.some((player) => player.character === character));

  // choose a random character for each player that has not selected a character
  //players.forEach(async (player) => {});

  for (const player of players) {
    //if the player has not selected a character
    if (player.character === null) {

      //select a random character from the available characters
      const character = charactersAvailable[Math.floor(Math.random() * charactersAvailable.length)];

      //remove the character from the available characters
      charactersAvailable = charactersAvailable.filter((char) => char !== character);

      //update the character of the player
      player.character = character;

      //update the character of the player in the database
      await controller.selectCharacter(player.userName, character);
    }
  }


  //calculate the number of bots needed
  const n_bots = charactersAvailable.length;
  
  //create bots
  let bots_inf=[]
  // console.log("n_bots", n_bots);
  for (let i = 0; i < n_bots; i++) {

    //generate a random number between 1 and 3 for level
    let random_level = Math.floor(Math.random() * 3) + 1;

    //select a random character from the available characters
    const character = charactersAvailable[0];
    //const character = charactersAvailable[Math.floor(Math.random() * charactersAvailable.length)];
    console.log("character [", i,  "] ", character, " level: ", random_level);
    //remove the character from the available characters
    charactersAvailable = charactersAvailable.filter((char) => char !== character);

    //console.log("charactersAvailable", charactersAvailable);
    
    //1 and 6 for the group
    const idx = constants.CHARACTERS_NAMES.indexOf(character);
    
    //generate a name for the bot's username
    const username = "bot" + group + idx;
    //console.log("Nivel de bot ",username,": ", random_level);
    
    //insert bot in the database
    //LUO
    await controller.createBot(username,random_level);
    
    //join bot to the game
    await controller.joinGame(username, group);
    
    //update the character of the bot
    await controller.selectCharacter(username, character);
    
    //add the bot to the players array
    players.push({userName: username, character: character});

    //save bot info in the array
    bots_inf.push({username: username, level: random_level });
  }

  //get player whose character == last_character
  const last_player = players.find((char) => char.character == constants.CHARACTERS_NAMES[constants.CHARACTERS_NAMES.length - 1]);
  console.log("player_soper", last_player);
  await controller.updateTurno(group, last_player.userName);

  //deal cards to players
  let dealCards = await controller.dealCards(players, group);
  // console.log("dealCards", dealCards);

  // send cards to each player
  relaciones_socket_username.forEach((s) => {

    //find the index of the player in the players array
    const idx = players.findIndex((player) => player.userName === s.username); 

    //send the cards to the player
    io.to(s.socket_id).emit("cards", dealCards.cards[idx]); // 馃摡

  });
  
  for(let bot of bots_inf){
    //find the index of the player in the players array
    const idx = players.findIndex((player) => player.userName === bot.username);
    // Last character of player.userName transformed to integer
    console.log("idx", idx);

    console.log("cards => ", dealCards.cards[idx]);
    const data = createBot(idx,  dealCards.cards[idx]);
    await controller.update_players_info(bot.username, data, null);

  }
  

  // get all players with their characters
  const all_players = await controller.getPlayersCharacter(group);
  
  players_in_order.group = { username: [], character: [] };

  // order players by character
  console.log("all_players", all_players);
  constants.CHARACTERS_NAMES.forEach((character) => {
    const player = all_players.players.find((player) => player.character === character);
    console.log("player", player);
    const username = player.userName;
    players_in_order.group.username.push(username);
    players_in_order.group.character.push(character);
  });


  // const { areAvailable } = await controller.availabilityCharacters(group);
  // console.log("areAvailable", areAvailable);

  //send players the game start message with relevant information
  relaciones_socket_username.forEach(async (s) => {
    io.to(s.socket_id).emit('start-game-response', { // 📩😍
      names: constants.CHARACTERS_NAMES, 
      guns: constants.GUNS_NAMES,
      rooms: constants.ROOMS_NAMES,
      available: players_in_order.group.username,
      posiciones: [120, 432, 561, 16, 191, 566],
    });
  });

  // Iniciar el primer turno
  handleNextTurn(group, -1, io);
}
  // Avisar al primer jugador del grupo que es su turno

const handleTurnoBot = async (turnoOwner, group, character, io) => {

    //time to conclude suspicions
  function esperaActiva(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
  
  async function ejecucion(time) {
    //console.log("Comienzo de la espera activa");
    //io.to(group).emit('conclude-suspicions', {}); // 📩
    await esperaActiva(time); // Espera activa de 10 segundos
   // console.log("Fin de la espera activa");
  }
  
  io.to(group).emit('turno-owner', turnoOwner); // 📩
  // get the dice between 2 and 12
  const dice = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
  const me = constants.CHARACTERS_NAMES.indexOf(character);

  console.log("Comprobando si la partida sigue viva");
  if (!(await controller.isAlive(group))) return;
  console.log("Partida sigue viva");
  
  const { exito, positions, usernames } = await controller.information_for_bot(group);
  const { sospechas } = await controller.getSospechasBot(turnoOwner)
  console.log("positions", positions);

  console.log("me", me);
  console.log("dice", dice);

  let data;
  try {
    data = await moveBot(positions, me, dice, sospechas, group);
    console.log("data", data);
    console.log("data", data.toString());
    data = data.toString().split(',');
  
    // Eliminar el ultimo elemento del array
    data = data.slice(0, -1);
  
    //check if the bot has entered a room
    let move = parseInt(data[1]);
    console.log("updatePositionInit")
    await controller.updatePosition(turnoOwner, move);
    console.log("updatePositionFinish");
    
    io.to(group).emit('turno-moves-to-response', turnoOwner, move); // 📩
    // const fin = ( data[2] == -1 ? true : false);
    // console.log(typeof data[2])
    // console.log("data[2]: \"" +data[2]+"\"");
    const fin = (data[2] === "FIN");
    await ejecucion(10000);
    if (!(await controller.isAlive(group))) return;
  
    if (!fin) { // Se entra en una habitación

      console.log("El turno NO termina aquí");
      const suspect = data[2] == 'SUSPECT' ;
      let room = data[3];
      // Replace ':n' by 'ñ'
      room = room.replace(/:n/g, 'ñ');
      console.log("room", room);
      let character = data[4];
      // console.log("character", character);
      let gun = data[5];
      // console.log("gun", gun);
      
      // console.log(players_in_order.group);
      io.to(group).emit('turno-asks-for-response', turnoOwner, character, gun, room, !suspect);
  
      if (suspect) {
        // console.log("suspect");
        const { user } = await controller.turno_asks_for(group, turnoOwner, character, gun, room, players_in_order.group.username);
        const username_shower = user;
        console.log("Enseñando carta ", username_shower);
        
        if (username_shower == "") {
          // nadie tiene cartas para enseñar
          io.to(group).emit('turno-show-cards', turnoOwner, "", "", character, gun, room);
          // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
  
          const idx_card = -1;
          await actualizar_bots(group, turnoOwner, turnoOwner, idx_card, room, character, gun);
  
          handleNextTurn(group, -1,io);
  
          return;
  
        } else if (username_shower.includes("bot")) {
          const { cards } = await controller.getCards(username_shower,group);
          let cards_coincidences = cards.filter((card) => card == character || card == gun || card == room);
          //Get random card of cards_coincidences
          let card_to_show = cards_coincidences[Math.floor(Math.random() * cards_coincidences.length)];
          
          io.to(group).emit('turno-show-cards', turnoOwner, username_shower, card_to_show, character, gun, room);
  
          // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
  
          const card_type = card_to_show == character ? 1 : (card_to_show == gun ? 2 : 0);
          await actualizar_bots(group,username_shower,turnoOwner,card_type,room,character,gun);
  
          handleNextTurn(group, -1,io);
  
          return;
  
        } else {
          // un jugador real enseña una carta
          const socket_shower = relaciones_socket_username.find((s) => s.username === username_shower);
  
          const timeoutId2 = setTimeout(async() => {
            // en caso de que se venza el tiempo del turno, se eliminan los eventos y se salta al siguiente turno
            // console.log("Se ha acabado el tiempo del turno de", turnoOwner);
            socket_shower?.socket.removeAllListeners();
  
            const { cards } = await controller.getCards(username_shower, group);
            let cards_coincidences = cards.filter((card) => card == character || card == gun || card == room);
            //Get random card of cards_coincidences
            let card_to_show = cards_coincidences[Math.floor(Math.random() * cards_coincidences.length)];
  
            io.to(group).emit('turno-show-cards', turnoOwner, username_shower, card_to_show, character, gun, room);
  
            const card_type = card_to_show == character ? 1 : (card_to_show == gun ? 2 : 0);
            await actualizar_bots(group, username_shower, turnoOwner, card_type, room, character, gun);
            await ejecucion(12000);

            handleNextTurn(group, -1,io);
  
            return;
          }, 15000); // dejar en 15 segundos
  
          io.to(socket_shower?.socket_id).emit('turno-select-to-show', turnoOwner, username_shower, character, gun, room);
  
          const onTurnoCardSelected = async (turnoOwner, username_shower, card) => {
            // reenviar al resto de jugadores la carta mostrada
            io.to(group).emit('turno-show-cards', turnoOwner, username_shower, card, character, gun, room);
            socket_shower?.socket.off('turno-card-selected', onTurnoCardSelected);
  
            // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
            clearTimeout(timeoutId2);
            
            const card_type = card == character ? 1 : (card == gun ? 2 : 0);
            await actualizar_bots(group,username_shower,turnoOwner,card_type,room,character,gun);
            
            await ejecucion(12000);
            handleNextTurn(group, -1,io);
  
            return;
          };
          socket_shower?.socket.on('turno-card-selected', onTurnoCardSelected);
        }
  
      } else { //Accuse_to
        // console.log("Accuse_to");
        const { exito } = await controller.acuse_to(turnoOwner, group, character, gun, room);
        io.to(group).emit('game-over', turnoOwner, exito);
        if (exito) {
          // eliminar la partida, players, ...
          console.log("FIN. Ha ganado el jugador: ", turnoOwner);
          return;
        } else {
          // eliminar al jugador que ha perdido
          // igual esto ya se hace en acuse_to
          console.log("FIN. Ha perdido la partida: ", turnoOwner);
          const idx_player = players_in_order.group.username.indexOf(turnoOwner);
          
          await ejecucion(6000);
          handleNextTurn(group, idx_player,io);
  
          return;
        }
      }
    }
    else { // NO se entra en una habitación
      console.log("El turno termina aquí");
      handleNextTurn(group, -1,io);
  
      return;
    }
  }
  catch (error) {
    console.error('Hubo un error:', error.toString());
  }
};

//updateCard(me, lvl, asker, holder, where, who, what, hasSmg, tarjeta)
const actualizar_bots = async (group, hold, turnoOwner, idx_card, where, who, what) => {
  //solo bots
  const bots = await controller.getBotsInfo(group);
  const { positions, usernames } = await controller.information_for_bot(group);

  // Iterador sobre bots.personajes
  for (let bot of bots.personajes) {
    // Si bot no es undefined, se actualiza la carta enseñada por el bot
    if (bot) {
      const idx = bots.personajes.indexOf(bot);
      let asker = usernames.indexOf(turnoOwner);
      let holder = usernames.indexOf(hold);
      // Reemplazar las ñ por :n
      where = where.replace(/ñ/g, ':n');
      try {
        const data = await updateCard(idx, bots.niveles[idx], asker, holder , where, who, what, idx_card, bots.sospechas[idx])
        await controller.update_players_info(players_in_order.group.username[idx], data, null)
        // printCard(data);
      } catch (error) {
        console.error('Hubo un error:', error.toString());
      }
    }
  }
}

// Bucle de juego, donde se va cambiando el turno cuando corresponde. 
// Lógica para manejar el turno de un jugador
const handleTurno = async (turnoOwner, socketOwner, characterOwner, group,io) => {
  console.log("Es el turno de:", turnoOwner);

  if (turnoOwner.includes("bot")) {
    
    await handleTurnoBot(turnoOwner, group, characterOwner, io); // gestión de bot en otra función aparte
    return;
  }
    
  let timeoutId = setTimeout(() => { 
    // en caso de que se venza el tiempo del turno, se eliminan los eventos y se salta al siguiente turno
    // console.log("Se ha acabado el tiempo del turno de", turnoOwner);
    socketOwner.socket.removeAllListeners();
    console.log("El jugador", turnoOwner, "no ha hecho nada en su turno");

    idx_player = players_in_order.group.username.indexOf(turnoOwner);
    handleNextTurn(group, idx_player, io);
    return;
  }, 47000); // dejar en 47 segundos 

  io.to(group).emit('turno-owner', turnoOwner); // 📩


  // Manejador para el evento turno-moves-to
  const onTurnoMovesTo = async (username, position, fin) => {
    // reenviar a todos el movimiento del jugador
    clearTimeout(timeoutId);
    console.log("El jugador", username, "se ha movido a la posición", position);
    io.to(group).emit('turno-moves-to-response', username, position); // 📩
    console.log("updatePositionInit");
    await controller.updatePosition(username, position);
    console.log("updatePositionFinish");
    socketOwner.socket.off('turno-moves-to', onTurnoMovesTo);
    if (!fin) {
      // Entras en una habitación (se hace pregunta)
      console.log("El turno NO termina aquí");

      const onTurnoAsksFor = async (username_asking, character, gun, room, is_final) => {
        // reenviar la pregunta a todos los jugadores
        io.to(group).emit('turno-asks-for-response', username_asking, character, gun, room, is_final);
        socketOwner.socket.off('turno-asks-for', onTurnoAsksFor);

        if (is_final) {
          const { exito } = await controller.acuse_to(username_asking, group, character, gun, room);
          io.to(group).emit('game-over', username_asking, exito);
          if (exito) {
            // eliminar la partida, players, ... // LUO
            console.log("FIN. Ha ganado el jugador: ", username_asking);
            return;
          } else {
            // eliminar al jugador que ha perdido
            // igual esto ya se hace en acuse_to
            console.log("FIN. Ha perdido la partida: ", username_asking);
            const idx_player = players_in_order.group.username.indexOf(username_asking);
            handleNextTurn(group, idx_player, io);
            return;
          }
        } else {
          // buscar quien es el jugador que debe enseñar la carta
          console.log("Orden de los jugadores", players_in_order.group.username);
          const { user } = await controller.turno_asks_for(group, username_asking, character, gun, room, players_in_order.group.username);
          const username_shower = user;
          // console.log("username_shower", username_shower);

          if (username_shower == "") {
            // nadie tiene cartas para enseñar
            io.to(group).emit('turno-show-cards', username_asking, "Nadie", "", character, gun, room);

            await actualizar_bots(group, turnoOwner, turnoOwner, -1, room, character, gun);
            handleNextTurn(group, -1, io);
            return;
          }
          else if (username_shower.includes("bot")) {
            // Un bot enseña una carta
            const { cards } = await controller.getCards(username_shower,group);
            let cards_coincidences = cards.filter((card) => card == character || card == gun || card == room);
            //Get random card of cards_coincidences
            let card_to_show = cards_coincidences[Math.floor(Math.random() * cards_coincidences.length)];
            
            io.to(group).emit('turno-show-cards', turnoOwner, username_shower, card_to_show, character, gun, room);

            const card_type = card_to_show == character ? 1 : (card_to_show == gun ? 2 : 0);
            await actualizar_bots(group,username_shower,turnoOwner,card_type,room,character,gun);
            handleNextTurn(group, -1, io)
            return;
          }
          else {
            // un jugador real enseña una carta
            const socket_shower = relaciones_socket_username.find((s) => s.username === username_shower);

            const timeoutId2 = setTimeout(async() => {
              // en caso de que se venza el tiempo del turno, se eliminan los eventos y se salta al siguiente turno
              // console.log("Se ha acabado el tiempo del turno de", turnoOwner);
              socketOwner.socket.removeAllListeners();
              socket_shower?.socket.removeAllListeners();

              const { cards } = await controller.getCards(username_shower, group);
              let cards_coincidences = cards.filter((card) => card == character || card == gun || card == room);
              //Get random card of cards_coincidences
              let card_to_show = cards_coincidences[Math.floor(Math.random() * cards_coincidences.length)];

              io.to(group).emit('turno-show-cards', username_asking, username_shower, card_to_show, character, gun, room);

              const card_type = card_to_show == character ? 1 : (card_to_show == gun ? 2 : 0);
              await actualizar_bots(group, username_shower, turnoOwner, card_type, room, character, gun);

              handleNextTurn(group, -1, io);
              return;
            }, 15000); // dejar en 15 segundos

            io.to(socket_shower.socket_id).emit('turno-select-to-show', username_asking, username_shower, character, gun, room);
            // socket_shower.socket.emit('turno-select-to-show', username, username_shower, character, gun, room);

            const onTurnoCardSelected = async (username_asking, username_shower, card) => {
              // reenviar al resto de jugadores la carta mostrada
              io.to(group).emit('turno-show-cards', username_asking, username_shower, card, character, gun, room);
              socket_shower.socket.off('turno-card-selected', onTurnoCardSelected);

              // eliminar el timeout ya que el jugador ha terminado el turno satisfactoriamente
              clearTimeout(timeoutId2);
              
              const card_type = card == character ? 1 : (card == gun ? 2 : 0);
              await actualizar_bots(group,username_shower,turnoOwner,card_type,room,character,gun);
              handleNextTurn(group, -1, io);
              return;
            };
            socket_shower.socket.on('turno-card-selected', onTurnoCardSelected);
          }
        }
      }
      socketOwner.socket.on('turno-asks-for', onTurnoAsksFor);
    } else {
      // No has entrado en ninguna habitación (no se hace pregunta)
      console.log("El turno termina aquí");

      // Continuar con el siguiente turno
      handleNextTurn(group, -1, io);
      return;
    }
    
  };
  // Registrar el evento turno-moves-to para este jugador
  socketOwner.socket.on('turno-moves-to', onTurnoMovesTo);
};

// Lógica para manejar el próximo turno
const handleNextTurn = async(group, last_turn, io) => {


  console.log("Comprobando si la partida sigue viva");
  if (!(await controller.isAlive(group))) return;
  console.log("Partida sigue viva");

  // guardar todas las sospechas de los usuarios 
  io.to(group).emit('request-sospechas', {}); // 📩

  if (game_info.group.pause) {
    io.to(group).emit('game-paused-response', {}); // 📩
    return;
  };
  
  
  setTimeout(async () => {

    const { exito, turno:turno_username, turno_character } = await controller.changeTurn(group, last_turn); // turno.turno es un username

    if (!exito) {
      console.log("Error al cambiar de turno");
      return;
    }

    console.log("El turno ha pasado a:", turno_username);

    const turnoOwner = turno_username;
    const socketOwner = relaciones_socket_username.find((s) => s.username === turnoOwner);


    // si al principio de tu turno no estás conectado, se salta al siguiente
    if (!socketOwner && !turnoOwner.includes("bot")) { 
      handleNextTurn(group, -1, io);
      return;
    }
    else {
      // Manejar el turno para el siguiente jugador
      handleTurno(turnoOwner, socketOwner, turno_character, group, io);
      return;
    }
  }, 2000);
};


module.exports = {
  runGame,
};
