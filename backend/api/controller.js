// Módulo encargado de la realización de operaciones CRUD
//(Create, Read, Update, Delete) sobre la base de datos
const pool = require("./connectionManager");
const constants = require("./constants.js");

const verbose_pool_connect = false;
const verbose_client_release = false;

//**************************************LOGIN************************************************* */
//return exito and username
async function createAccount(username, password) {
  const selectQuery = constants.SELECT_USER_USUARIO;
  const selectValues = [username];

  const insertQuery_player = constants.INSERT_JUGADOR;
  const insertValues_player = [username, null, null, null, null, constants.CERO];

  const insertQuery_user = constants.INSERT_USUARIO;
  const insertValues_user = [username, password, 0, 0, 0, 0];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect 1");
  try {
    //check if userName already exits
    const selectResult = await client.query(selectQuery, selectValues);

    //the userName already exits //return !exito and userName
    if (selectResult.rows.length > 0)
      return { exito: false, username: selectResult.rows[0].username };
    else {
      //username doesnt exist yet

      //insert the userName like player and user
      await client.query(
        insertQuery_player,
        insertValues_player
      );
      const insertResult_user = await client.query(
        insertQuery_user,
        insertValues_user
      );
      //return exito and userName
      return { exito: true, username: insertResult_user.rows[0].username };
    }
  } catch (error) {
    throw error;

  } finally {
    client.release();
    if (verbose_client_release)
      console.log("cliente.release1")
  }
}



//return exito and msg
async function login(username, password) {
  const selectQuery = constants.SELECT_PASSWD_USUARIO;
  const selectValues = [username];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect 2");
  try {
    //check if passwd of username is correct
    const selectResult = await client.query(selectQuery, selectValues);

    //username doesnt exist
    if (selectResult.rows.length == 0)
      return { exito: false, msg: constants.WRONG_USER };
    //wrong passwd
    else if (selectResult.rows[0].passwd != password)
      return { exito: false, msg: constants.WRONG_PASSWD };
    //login correcto
    else {
      const { partida_actual, tipo_partida } = await playerInformation(username, client);
      // const partida_actual = 0;
      return { exito: true, id_partida_actual: partida_actual, tipo_partida: tipo_partida, msg: constants.CORRECT_LOGIN };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release2")
  }
}

//return exito and msg
async function changePassword(username, oldPassword, newPassword) {
  const selectQuery = constants.SELECT_PASSWD_USUARIO;
  const selectValues = [username];

  const updateQuery_passwd = constants.UPDATE_PASSWD_USUARIO;
  const updateValues_passwd = [username, newPassword];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect3");
  try {
    //check if username exits
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length > 0) {
      //username exits
      //check if oldPasswd is correct
      if (selectResult.rows[0].passwd === oldPassword) {
        //correct oldPasswd

        //update values
        const updatetResult = await client.query(
          updateQuery_passwd,
          updateValues_passwd
        );
        //return exito and sucessful msg
        return { exito: true, msg: constants.CORRECT_CHANGE_PASSWD };
      } else return { exito: false, msg: constants.WRONG_PASSWD }; //incorrect oldPasswd  //return error and error msg : wrong passwd
    } else return { exito: false, msg: constants.WRONG_USER }; //username doesnt exist //return error and error msg : user doesnt exist
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release3")
  }
}

//*****************************************CHAT*********************************************** */
//return exito and msg
async function saveMsg(currentTimestamp, group, isQ, msg, emisor) {
  //falta meter isQ

  const insertQuery = constants.INSERT_CONVERSACION;
  const insertValues = [currentTimestamp, isQ, group, msg, emisor];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect4");
  try {
    // Realizar la consulta SELECT para verificar si la dirección ya existe
    const insertResult = await client.query(insertQuery, insertValues);

    if (insertResult.rows.length == 0) {
      //usuario no existe
      return { exito: false, msg: constants.WRONG_MSG };
    } else {
      //login correcto
      return { exito: true, msg: constants.CORRECT_MSG };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release4")
  }
}

//return exito and  if error -> msg else -> mensajes
async function restoreMsg(currentTimestamp, group) {
  const selectQuery = constants.SELECT_ALL_CONVERSACION;
  const selectValues = [currentTimestamp, group];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect5");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_LDR_MSG };
    } else {
      const mensajes = selectResult.rows.map((row) => ({
        mensaje: row.contenido,
        emisor: row.emisor,
        esPregunta: row.isQuestion,
        instante: row.instante,
      }));
      return { exito: true, mensajes: mensajes };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release5")
  }
}


//*****************************************player******************************************** */
//return exito and  if error -> msg else -> id_partida

// post: return availability of characters in the current game
// vector which has null at the index of the character that is available
// otherwise it has the index of the user that has the character
// ---------------------------------------------------------------------
// ['', '', '', '', '', ''] -> all characters are available
// ['', user1, '', '', '', ''] -> user1 has the character "missRedes"
// [mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA] -> order of characters
// ---------------------------------------------------------------------
async function availabilityCharacters(idGame) {

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect6");
  try {
    const availability_usernames = await currentCharacters(idGame);
    // console.log(availability_usernames);
    const availability = [];
    availability.length = constants.NUM_PLAYERS;
    availability.fill('');

    for (let i = 0; i < constants.NUM_PLAYERS; i++) {
      availability[i] = availability_usernames[i] == null ? '' : availability_usernames[i];
    }

    return {
      areAvailable: availability,
      characterAvaliable: constants.CHARACTERS_NAMES,
    }; // return the updated availability array
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release6")
  }
}

//pre: character is available
//post: character is assigned to the user
async function selectCharacter(username, character) {
  const updateQuery_player = constants.UPDATE_FICHA_JUGADOR;
  const updateValues_player = [username, character];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect7");
  try {
    const updateResult = await client.query(
      updateQuery_player,
      updateValues_player
    );


    if (updateResult.rows.length == 0) return { exito: false, msg: constants.ERROR_UPDATING };
    else {
      const idx = constants.CHARACTERS_NAMES.indexOf(character);
      const position = constants.INITIAL_POSTIONS[idx];
      updatePosition(username, position);
      return { exito: true, msg: constants.CORRECT_UPDATE };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release7")
  }
}

async function getPlayersCharacter(idGame) {
  //get player where partida=idGame
  const selectQuery = constants.SELECT_FICHA_JUGADOR;
  const selectValues = [idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect8");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      return {
        exito: true,
        players: selectResult.rows.map((row) => ({
          userName: row.username,
          character: row.ficha,
        })),
      };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release8")
  }
}

/**
 * Postcondition:
 * - If  "player" information is successfully retrieved from the database:
 *   - The function returns an object with the following properties:
 *     - exito: true if successful, false otherwise.
 *     - character: The character associated with the player, it's a character.
 *     - partida_actual: The ID of the current game the player is participating in.
 *     - sospechas: The string that contains the suspicions the player has raised.
 *     - posicion: The position of the player in the game.
 *     - estado: The current state of the player (0 --> inactive, 1 --> active).
 *     - partidas_jugadas: The total number of games played by the player.
 *     - partidas_ganadas_local: The number of games won locally by the player.
 *     - partidas_ganadas_online: The number of games won online by the player.
 *     - XP: The experience points earned by the player.
 * - If the player information cannot be found in the database:
 *   - The function returns an object with success set to false and a message indicating that the player ID is incorrect or not found.
 */
async function playerInformation(player/* , client=null */) {
  // Query to fetch player information
  const selectQuery = constants.SELECT_INFO_JUGADOR;
  const selectValues = [player];


  // const old_client = client;
  //if (!client) client = await pool.connect();
  // Connect to the database client
  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect9");

  try {
    // Execute the query to fetch player information
    const selectResult = await client.query(selectQuery, selectValues);

    // Check if any results are found
    if (selectResult.rows.length === 0) {
      // If no results are found, return an error message
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      // If results are found, return player information
      return {
        exito: true,
        character: selectResult.rows[0].ficha,
        partida_actual: selectResult.rows[0].id_partida,
        sospechas: selectResult.rows[0].sospechas,
        posicion: selectResult.rows[0].posicion,
        estado_player: selectResult.rows[0].estado,
        partidas_jugadas: selectResult.rows[0].n_jugadas,
        partidas_ganadas_local: selectResult.rows[0].n_ganadas_local,
        partidas_ganadas_online: selectResult.rows[0].n_ganadas_online,
        // XP: selectResult.rows[0].XP,
        estado_partida: selectResult.rows[0].estado_partida,
        tipo_partida: selectResult.rows[0].tipo_partida,
      };
    }
  } catch (error) {
    // Catch and throw any errors that occur
    throw error;
  } finally {
    // Release the database client after usage
    client.release();

    if (verbose_client_release)
      console.log("cliente.release9")
  }
}

//DELETE 
async function getPlayerXP(username) {
  const selectQuery = constants.SELECT_XP_USUARIO;
  const selectValues = [username];

  const client = await pool.connect();

  if (verbose_pool_connect)
    console.log("pool connect10");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_USER };
    } else {
      return { exito: true, XP: selectResult.rows[0].XP };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release10")
  }
} // informacion como xp

async function getCards(player, idGame) {
  const selectQuery = constants.SELECT_CARTAS_JUGADOR;
  const selectValues = [player, idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect11");
  try {
    const selectResult = await client.query(selectQuery, selectValues);
    // console.log("selectResult.rows: ", selectResult.rows);
    // console.log("selectResult.rows.length: ", selectResult.rows.length);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_USER };
    } else {
      // list with all the cards of the player obtained in the selectResult
      const cartas = selectResult.rows.map((row) => row.carta);
      // console.log("selectResult.rows: ", selectResult.rows);
      // console.log("cartas: ", cartas);

      return {
        exito: true,
        cards: cartas,
      };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release11")
  }
}

//reparte las cartas entre los players,
//podría pasarle todos los idplayeres que estan en la partida
// POST: devuelve las cartas en un vector en funcion de como han entrado en players
// si players = [user1, user2, user3] devuelve = [[c1,c2,c3],[c4,c5,c6],[c7,c8,c9]]
// siendo c1,c2,c3 las cartas de user1
async function dealCards(players, idGame) {
  //consulta que devuelve en una vector de vectores las cartas de cada player
  const selectQuery = constants.SELECT_CARTAS_DISTINT_SOLUTION;
  const selectValues = [idGame];

  // rellenar el players con los nombres de los bots

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect12");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      let cardsNotSolution = [];
      let playersUsername = [];
      for (let i = 0; i < selectResult.rows.length; i++) {
        cardsNotSolution[i] = selectResult.rows[i].cards;
        if (i < players.length) {
          playersUsername[i] = players[i].userName;
        }
      }

      // console.log("cardsNotSolution length: ", cardsNotSolution.length, " value: ", cardsNotSolution);

      const resultCards = await internalDealCards(playersUsername, cardsNotSolution, idGame);

      //  console.log("resultCards "+resultCards.cards[0]);
      return { exito: true, cards: resultCards.cards };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release12")
  }
}

//async function getSuspicions(player) {}

//****************************************JUEGO*********************************************** */
async function gameExists(username) {
  //user hasnt started a play

  //DUDA: no sé si devolver false si existe o si no existe
  // si no existe el user --> false
  // si esta jugando una partida --> true
  // si no esta jugando ninguna partida --> false

  // check if user exits and has an active game
  const selectQuery = constants.SELECT_PARTIDAandSTATE_JUGADOR;
  const selectValues = [username];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect13");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      //username doesnt exist
      return { exito: false, msg: constants.WRONG_USER };
    } else if (selectResult.rows[0].estado != constants.STOP) {
      // user is playing
      return { exito: true, id_partida: selectResult.rows[0].partida };
    } else {
      //user can start a new play
      return { exito: true };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release13")
  }
}

//return exito and if error -> msg else -> id_partida
async function createGame(type) {
  var exito = false;
  // generate random 6 digit numbers until one of them is valid
  do {
    const enteroSeisDigitos = generarEnteroSeisDigitos();
    const selectQuery = constants.SELECT_ID_PARTIDA;
    const selectValues = [enteroSeisDigitos];

    const client = await pool.connect();
    if (verbose_pool_connect)
      console.log("pool connect14");
    try {
      //check if this id already exists
      const selectResult = await client.query(selectQuery, selectValues);

      if (selectResult.rows.length == 0) {
        // id doesnt exist

        //get solution cards
        const asesino = await getAsesino();
        const arma = await getArma();
        const lugar = await getLugar();
        const date = getCurrentDate();

        // try to insert into partida
        const insertQuery_partida = constants.INSERT_PARTIDA;
        const insertValues_partida = [
          enteroSeisDigitos,
          constants.NOT_STARTED,
          date,
          type,
          null,
          asesino,
          arma,
          lugar,
        ];

        const insertResult_partida = await client.query(
          insertQuery_partida,
          insertValues_partida
        );

        //insert_error
        if (insertResult_partida.rows.length == 0)
          return { exito: exito, msg: constants.ERROR_INSERTING };

        exito = true;

        return { exito: exito, id_partida: enteroSeisDigitos, asesino: asesino, arma: arma, lugar: lugar };
      }
    } catch (error) {
      throw error;
    } finally {
      client.release();

      if (verbose_client_release)
        console.log("cliente.release14")
    }
  } while (!exito);
}

async function joinGame(username, idGame) {
  const updateQuery_player = constants.UPDATE_PARTIDAandSTATE_JUGADOR;
  const updateValues_player = [parseInt(idGame), username, constants.PLAY];

  // console.log(typeof idGame);
  // transformar idGame a int
  // const idGameInt = parseInt(idGame);

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect15");
  try {
    const updateResult = await client.query(
      updateQuery_player,
      updateValues_player
    );

    //update_error
    if (updateResult.rows.length == 0)
      return { exito: false, msg: constants.ERROR_UPDATING };
    else {
      return { exito: true, id_partida: idGame };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release15")
  }
}

async function leaveGame(username) {

  const updateQuery_player = constants.UPDATE_PARTIDAandSTATEandCHAR_JUGADOR;
  const updateValues_player = [null, username, constants.CERO, null, null];
  // si es mi turno cuando abandono, asignarlo a null
  // updateQuery_partida = constants.UPDATE_STATE_PARTIDA;

  // console.log(username + " abandona la partida");
  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect16");
  try {
    
    const updateResult = await client.query(
      updateQuery_player,
      updateValues_player
    );
    
    if (updateResult.rows.length == 0) return { exito: false, msg: constants.ERROR_UPDATING };
    else return { exito: true, msg: constants.CORRECT_UPDATE 

    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release16")
  }
}

//change the state of the game to stop
async function stopGame(idGame) {
  const result = await changeGameState(idGame, constants.PAUSE);
  return { exito: result.exito }
}

//change the state of the game to play
async function resumeGame(idGame) {
  const result = await changeGameState(idGame, constants.PLAY);
  return { exito: result.exito }
}

/**
 * Finaliza una partida eliminando la conversación asociada, todas las cartas de la partida
 * y actualiza el estado de la partida y del jugador.
 * @param {number} idGame - El ID de la partida que se va a finalizar.
 * @returns {Object} Un objeto que indica si la operación fue exitosa y un mensaje correspondiente.
 */
async function finishGame(idGame) {
  // Se preparan los valores para las consultas de eliminación
  const deleteValues = [idGame];

  // Se establece una conexión con el pool de PostgreSQL
  const client = await pool.connect();

  // Se muestra un mensaje en la consola si verbose_pool_connect está activo
  if (verbose_pool_connect) console.log("pool connect17");

  try {
    // Se ejecuta la consulta para eliminar la conversación asociada a la partida
    const deleteConversacion = constants.DELETE_GAME_CONVERSACION;
    await client.query(deleteConversacion, deleteValues);

    // Se ejecuta la consulta para eliminar todas las cartas de la partida
    const deleteCartas = constants.DELETE_ALL_CARDS_FROM_PARTIDA;
    await client.query(deleteCartas, deleteValues);

    await updateTurno(idGame, null);
    console.log("Eliminando bots")
    await removeBots(idGame);

    // Se ejecuta la consulta para actualizar el estado de la partida y del jugador
    const updateStateandPartidaQuery = constants.UPDATE_STATE_PARTIDA_FICHA_JUGADOR_WITH_PARTIDA;
    const updateStateandPartidaValues = [idGame, constants.CERO, null, null];
    await client.query(updateStateandPartidaQuery, updateStateandPartidaValues);


    // Se elimina la partida si no hay registros asociados
    const deletePartidaQuery = constants.DELETE_ALL_PARTIDA;
    await client.query(deletePartidaQuery, deleteValues);
    console.log("Partida eliminada");

    // Se retorna un mensaje de éxito
    return { exito: true, msg: constants.CORRECT_DELETE };

  } catch (error) {
    // Se lanza el error para manejarlo en un nivel superior
    throw error;
  } finally {
    // Se libera el cliente de la conexión
    client.release();

    // Se muestra un mensaje en la consola si verbose_client_release está activo
    if (verbose_client_release) console.log("cliente.release17")
  }
}

/**
 * Postcondition:
 * - If  "player" information is successfully retrieved from the database:
 *   - The function returns an object with the following properties:
 *     - exito: true if successful, false otherwise.
 *     - estado: The current state of the play (0 --> inactive, 1 --> active, 'p' --> stopped).
 *     - fecha_ini: The intial date of the play .
 *     - tipo: The type of game ('l' --> local, 'o' --> online).
 *     - turno: The name of the character who is taking the turn .
 * - If the player information cannot be found in the database:
 *   - The function returns an object with success set to false and a message indicating that the player ID is incorrect or not found.
 */
async function gameInformation(idGame) {
  // Query to fetch player information
  const selectQuery = constants.SELECT_INFO_GAME;
  const selectValues = [idGame];

  const availables = await availabilityCharacters(idGame);

  // Connect to the database client
  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect18");

  try {
    // Execute the query to fetch player information
    const selectResult = await client.query(selectQuery, selectValues);

    // Check if any results are found
    if (selectResult.rows.length === 0) {
      // If no results are found, return an error message
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      // If results are found, return player information
      return {
        exito: true,
        estado: selectResult.rows[0].estado,
        fecha_ini: selectResult.rows[0].ficha,
        tipo: selectResult.rows[0].tipo,
        turno: selectResult.rows[0].turno,
        areAvailable: availables.areAvailable,
      };
    }
  } catch (error) {
    // Catch and throw any errors that occur
    throw error;
  } finally {
    // Release the database client after usage
    client.release();

    if (verbose_client_release)
      console.log("cliente.release18")
  }
}

//posicion de players, 
//
async function getPlayerStateInformation(idGame, username) {
  const playerInf = await playerInformation(username);
  const playerCards = await getCards(username, idGame);

  const selectPostionQuery = constants.SELECT_POSICION_JUGADOR;
  const selectPositionValues = [idGame];


  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect19");
  try {
    const selectResult = await client.query(selectPostionQuery, selectPositionValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {

      let postion_of_characters = { character: [], position: [] };
      selectResult.rows.forEach(row => {
        let idx = constants.CHARACTERS_NAMES.indexOf(row.ficha);
        postion_of_characters.character[idx] = row.ficha;
        postion_of_characters.position[idx] = row.posicion;
      });

      return {
        exito: true,
        positions: postion_of_characters.position,
        sospechas: playerInf.sospechas,
        cards: playerCards.cards,
        turnoOwner: selectResult.rows[0].turno,
      };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release19")
  }
}


//check if the player has the card
async function playerHasCard(player, card, idGame) {
  const selectQuery = constants.SELECT_CARTA_JUGADOR;
  const selectValues = [player, card, idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect19");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_USER };
    } else {
      return { exito: true, card: selectResult.rows[0].carta, player: selectResult.rows[0].player };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release19")
  }
}


async function updatePosition(username, pos) {
  const updateQuery = constants.UPDATE_POSTION_PLAYER;
  const updateValues = [username, pos];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect23");
  try {
    const updateResult = await client.query(updateQuery, updateValues);
    console.log("updatingInside");
    if (updateResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_USER };
    } else {
      return { exito: true, msg: constants.CORRECT_UPDATE };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release23")
  }
}


async function changeTurn(idGame, idx_player) {
  //Pdte: update sospechas, position and others ..
  const selectQuery = constants.SELECT_TURN_PARTIDA;
  const selectValues = [idGame];
  const res = await availabilityCharacters(idGame);
  // console.log("characterAvailability: "+res.areAvailable);

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect20");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      const turno_player_username = selectResult.rows[0].turno;
      console.log("turno acabado para "+turno_player_username);
      const turno_player_character = res.characterAvaliable[res.areAvailable.indexOf(turno_player_username)];
      console.log("con ficha "+turno_player_character);
      let i = 1;
      let valido = false;
      let next_turn_character = turno_player_character;
      
      while (!valido && i <= constants.CHARACTERS_NAMES.length) {

        if (idx_player != -1){
          next_turn_character = res.characterAvaliable[(idx_player+i) % constants.CHARACTERS_NAMES.length];
        } else{
          next_turn_character = res.characterAvaliable[((res.areAvailable.indexOf(turno_player_username)) + i ) % constants.CHARACTERS_NAMES.length];
        }
        console.log("i: ", next_turn_character)
        // console.log("next_turn_character "+next_turn_character);
        i++;
        // si no existe ningun usuario con esa ficha en la partida se da por inactivo
        valido = await validateTurno(idGame, next_turn_character);
      }

      // obtener el username del character "next_turn_character"
      const username_next_turn = res.areAvailable[constants.CHARACTERS_NAMES.indexOf(next_turn_character)];
      // console.log("username_next_turn "+username_next_turn);

      //update turno
      await updateTurno(idGame, username_next_turn);

      return { exito: true, turno: username_next_turn, turno_character: next_turn_character };

    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release20")
  }

}

async function updateTurno(idGame, username) {
  const updateQuery = constants.UPDATE_TURNO_PARTIDA;
  const updateValues = [idGame, username];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect21");
  try {
    await client.query(updateQuery, updateValues);
    return { exito: true, msg: constants.CORRECT_UPDATE };
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release21")
  }
}

async function update_players_info(username, sospechas, position) {

  if (position != null) {
    await updatePosition(username, position);
  }
  const updateQuery = constants.UPDATE_SOSPECHAS;
  const updateValues = [username, sospechas];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect21");
  try {
    await client.query(updateQuery, updateValues);
    return { exito: true, msg: constants.CORRECT_UPDATE };

  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release21")
  }
}

//devuelve el user mas cercano segun el orden de usernameByOrder que tiene alguna de las cartas
async function turno_asks_for(idGame, usernameQuestioner, characterCard, weaponCard, placeCard, usernameByOrder) {
  console.log("entra en turno_asks_for");
  const selectQuery = constants.SELECT_DETERMINADAS_CARTAS_JUGADOR;

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect22");
  try {
    //if the character is found, then check if the player has the card
    const selectValues = [idGame, characterCard, weaponCard, placeCard];
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: true, user: '' }; //modificar

    } else {


      let resultArray = [];
      selectResult.rows.forEach(row => {
        resultArray.push({ exito: true, user: row.user, card: row.cartas });
      });

      //eliminas las cartas que tiene el jugador que pregunta
      resultArray = resultArray.filter((row) => row.user !== usernameQuestioner);

      console.log("resultArray: ", resultArray);

      let i = usernameByOrder.indexOf(usernameQuestioner);

      let result = [];
      let j = i+1;
      for (let k = 0; k < usernameByOrder.length; k++) {
          j %= usernameByOrder.length;
          let row = resultArray.find((row) => row.user === usernameByOrder[j]);
          if (row) {
            result.push(row);
              break;
          }
          j++;
      }
      console.log("result: ", result);
      // resultArray tiene ordenados los jugadores que tienen alguna de las cartas
      // quieres el primer jugador en el order de usernameByOrder a partir de ti, que aparece en resultArra

      return result[0] ? { exito: true, user: result[0].user } : { exito: true, user: '' };
    }

  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release22")
  }
}

async function acuse_to(player, idGame, characterCard, weaponCard, placeCard) {
  const selectQuery = constants.SELECT_SOLUTION;
  const selectValues = [idGame, characterCard, weaponCard, placeCard];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect23");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      console.log("perdio");
      await lose(player);
      console.log("acabo de perder");
      return { exito: false, msg: constants.WRONG_ACUSE };
    } else {
      await win(idGame, player);
      return { exito: true, msg: constants.CORRECT_ACUSE };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release23")
  }
}

//sumar XP 
async function win(idGame, idPlayer) {
  //obtener num de bots and xp de los user que estan jugando
  const selectQuery_bot = constants.SELECT_INFO_END_GAME;
  const selectQuery_type = constants.SELECT_TYPE_GAME;
  const selectValues = [idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect33");
  try {
    const selectBot = await client.query(selectQuery_bot, selectValues);
    const selectType = await client.query(selectQuery_type, selectValues);

    if (selectBot.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {

      let resultArray = [];
      for (let i = 0; i < 3; i++) {
        let n_bots = selectBot.rows.find((row) => i == row.nivel)?.n_bots;
        if (!n_bots) n_bots = 0;
        resultArray.push({ exito: true, nivel: i, n_bots: n_bots });
      }

      const type = selectType.rows[0].tipo;
      const xp_to_add = calculateXP(resultArray[0].n_bots, resultArray[1].n_bots, resultArray[2].n_bots, type);
      console.log("xp:" + xp_to_add);

      await playerWin(idPlayer, xp_to_add, type);
      await finishGame(idGame);
      return { exito: true, msg: constants.WIN };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release33")
  }


}

//al perder, el jugador || socket se mantiene
async function lose(idPlayer) {
  await leaveGame(idPlayer);
}

async function isAlive(idGame){

  const selectAlivePlayers = constants.SELECT_JUGADORES_PARTIDA;
  const selectAliveValues = [idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect 1");
  try {

    const selectAliveResult =  await client.query(selectAlivePlayers,selectAliveValues);
    let alive = selectAliveResult.rows.length > 0;

    // console.log("selectResult " + selectResult.rows[0].partida);
    // console.log("alivePlayers " + selectResult.rows.length)
    if(!alive){
      finishGame(idGame);
    }

    return alive
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release1")
  }

}

//********************************************BOTS********************************************* */
async function createBot(username, lvl) {

  const insertQuery_bot = constants.INSERT_BOT;
  const insertValues_bot = [username, lvl];
  const inserBotlikePlayerQuery = constants.INSERT_JUGADOR;
  const insertPlayerValues = [username, null, null, null, null, constants.CERO];


  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect 1");
  try {
    //check if userName already exits
    const insert_player = await client.query(inserBotlikePlayerQuery, insertPlayerValues);

    //the userName already exits //return !exito and userName
    if (insert_player.rows.length < 0)
      return { exito: false, msg: constants.ERROR_INSERTING };
    else {
      //return exito and userName
      const insertResult = await client.query(insertQuery_bot, insertValues_bot);
      return { exito: true, username: insertResult.rows[0].username };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release1")
  }
}

async function removeBots(idGame) {
  //const deleteCards = constants.DELETE_ALL_CARDS_FROM_PARTIDA;
  const deleteBotsQuery = constants.DELETE_ALL_BOTS_FROM_BOT;
  const deleteValues = [idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect 1");
  try {

    // console.log("Eliminando cartas y bots")
    // await client.query(deleteCards, deleteValues);

    await client.query(deleteBotsQuery, deleteValues);

    const deletePlayer = constants.DELETE_ALL_BOTS_FROM_JUGADOR;
    
    await client.query(deletePlayer, deleteValues);

    return { exito: true };

  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release1")
  }
}

//devuelve lvl, sospechas 
async function getBotsInfo(idGame) {
  const selectQuery = constants.SELECT_INFO_BOTS;
  const selectValues = [idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect 1");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      let sospechas = [];
      let personajes = [];
      let niveles = [];
      selectResult.rows.forEach(row => {
        let idx = constants.CHARACTERS_NAMES.indexOf(row.personaje);
        sospechas[idx] = row.sospechas;
        personajes[idx] = row.personaje;
        niveles[idx] = row.level;
      });

      return {
        exito: true,
        sospechas: sospechas,
        personajes: personajes,
        niveles: niveles,
      };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release1")
  }
}

async function information_for_bot(idGame) {
  const selectQuery = constants.SELECT_INFO_PLAYERS_IN_GAME;
  const selectValues = [idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect 1");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      let posicion = [];
      let usernames = [];
      selectResult.rows.forEach(row => {
        let idx = constants.CHARACTERS_NAMES.indexOf(row.personaje);
        posicion[idx] = row.posicion;
        usernames[idx] = row.username;
      });

      return {
        exito: true,
        positions: posicion,
        usernames: usernames,
      };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release1")
  }
}

async function getSospechasBot(username) {
  const selectQuery = constants.SELECT_SOSPECHAS_BOT;
  const selectValues = [username];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect 1");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      return {
        exito: true,
        sospechas: selectResult.rows[0].sospechas,
      };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release1")
  }
}
//********************************************AUX********************************************* */
function calculateXP(nBots_1, nBots_2, nBots_3, type) {
  let xp = 0;
  const XP_PER_BOT_1 = 5;
  const XP_PER_BOT_2 = 10;
  const XP_PER_BOT_3 = 15;
  const XP_PER_PLAYER = 12;
  const XP_BOTS = XP_PER_BOT_1 * nBots_1 + XP_PER_BOT_2 * nBots_2 + XP_PER_BOT_3 * nBots_3;

  const totalBots = parseInt(nBots_1) + parseInt(nBots_2) + parseInt(nBots_3);
  console.log("totalBots: " + totalBots);

  if (type === constants.LOCAL) xp = XP_BOTS + XP_PER_PLAYER * (constants.NUM_PLAYERS - (totalBots));
  else if (type === constants.ONLINE) xp = XP_BOTS + 20 * (constants.NUM_PLAYERS - totalBots);
  else return "Tipo de juego no válido. Por favor, ingresa 'local' o 'online'.";

  console.log("xp: " + xp);

  return xp;
}

async function validateTurno(idGame, ficha) {
  console.log("Validando turno")
  const selectValidTurn = constants.SELECT_VALID_TURN_PARTIDA;
  const validTurnValues = [idGame, ficha];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect34");
  try {
    const selectResult = await client.query(selectValidTurn, validTurnValues);
    // console.log("n", selectResult.rows[0].n);

    if (selectResult.rows[0].n == 0) return false;
    else return true;

  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release) console.log("cliente.release34")
  }
}

// type = 'o' --> online || type = 'l' --> local
async function playerWin(idPlayer, xp, type) {

  let updateQuery;
  if (type == constants.LOCAL) updateQuery = constants.UPDATE_WIN_JUGADOR_LOCAL;
  else updateQuery = constants.UPDATE_WIN_JUGADOR_ONLINE;

  const updateValues = [idPlayer, xp];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect32");
  try {
    const updateResult = await client.query(updateQuery, updateValues);

    if (updateResult.rows.length == 0) return { exito: false, msg: constants.WRONG_IDGAME };
    else {

      return { exito: true, msg: constants.CORRECT_UPDATE };
    }

  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release32")
  }
}

function generarEnteroSeisDigitos() {
  var min = 100000;
  var max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCurrentDate() {
  var fechaActual = new Date();

  var año = fechaActual.getFullYear();

  var mes = fechaActual.getMonth() + 1;

  var dia = fechaActual.getDate();

  // Formatear la fecha en el formato YYYY-MM-DD
  var fechaFormateada = año + "-" + mes + "-" + dia;

  // Mostrar la fecha formateada
  //console.log(fechaFormateada);
  return fechaFormateada;
}

async function getAsesino() {
  const determinar_asesino = constants.SELECT_NOMBRE_ASESINO;

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect24");
  try {
    const selectResult = await client.query(determinar_asesino);

    if (selectResult.rows.length == 0) {
      //usuario no existe
      return { exito: false, msg: constants.ERROR_ASESINO };
    } else {
      return selectResult.rows[0].nombre;
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release24")
  }
}

async function getArma() {
  const determinar_asesino = constants.SELECT_NOMBRE_ARMA;

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect25");
  try {
    const selectResult = await client.query(determinar_asesino);

    if (selectResult.rows.length == 0) {
      //usuario no existe
      return { exito: false, msg: constants.ERROR_ARMA };
    } else {
      return selectResult.rows[0].nombre;
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release25")
  }
}

async function getLugar() {
  const determinar_asesino = constants.SELECT_NOMBRE_LUGAR;

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect26");
  try {
    const selectResult = await client.query(determinar_asesino);

    if (selectResult.rows.length == 0) {
      //usuario no existe
      return { exito: false, msg: constants.ERROR_LUGAR };
    } else {
      return selectResult.rows[0].nombre;
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release26")
  }
}

async function internalDealCards(players, cards_available, idGame) {

  console.log("players: ", players);
  console.log("cards_available: ", cards_available);
  console.log("idGame: ", idGame);
  // Shuffle cards
  const cards = cards_available.slice(); // Copy the array to avoid modifying the original
  cards.sort(() => Math.random() - 0.5); // Sort randomly

  // Deal cards to each player
  const cards_player = Array.from({ length: constants.NUM_PLAYERS }, () => []);

  // Delete all cards from all players
  for (let i = 0; i < players.length; i++) {
    const playerIndex = i % constants.NUM_PLAYERS;
    await deleteCardsFromPlayer(players[playerIndex]);
  }

  for (let i = 0; i < cards.length; i++) {
    const playerIndex = i % constants.NUM_PLAYERS;


    if (players[playerIndex] == null) {
      console.log("NO SE REPARTE a player idx: " + playerIndex + " cards: " + cards[i]);
      continue;
    }

    cards_player[playerIndex].push(cards[i]);

    console.log("player: " + players[playerIndex] + " cards: " + cards[i]);

    await insertCards(players[playerIndex], cards[i], idGame);
  }

  return { exito: true, msg: constants.CORRECT_INSERT, cards: cards_player };

  //return { exito: false, msg: constants.ERROR_INSERTING };
}

// vector which has null at the index of the character that is available
// otherwise it has the index of the user that has the character
// ---------------------------------------------------------------------
// [null, null, null, null, null, null] -> all characters are available
// [null, user1, null, null, null, null] -> user1 has the character "missRedes"
// [mr SOPER, miss REDES, mr PROG, miss FISICA, mr DISCRETO, miss IA]
async function currentCharacters(idGame) {
  const selectQuery = constants.SELECT_FICHA_JUGADOR;
  const selectValues = [idGame];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect27");
  try {
    const selectResult = await client.query(selectQuery, selectValues);

    if (selectResult.rows.length == 0) {
      return { exito: false, msg: constants.WRONG_IDGAME };
    } else {
      const userNames = [];
      userNames.length = constants.NUM_PLAYERS;
      userNames.fill('');

      const character_idx = {
        [constants.SOPER]: 0,
        [constants.REDES]: 1,
        [constants.PROG]: 2,
        [constants.FISICA]: 3,
        [constants.DISCRETO]: 4,
        [constants.IA]: 5,
      };

      console.log("idGame currentCharacters", idGame);

      for (let i = 0; i < selectResult.rows.length; i++) {
        // console.log(selectResult.rows[i].userName + "= "+ character_idx[selectResult.rows[i].ficha]);
        if (selectResult.rows[i].ficha) userNames[character_idx[selectResult.rows[i].ficha]] =
          selectResult.rows[i].username;
      }
      // console.log("userNames which returned "+userNames);
      return userNames; // return the updated availability array
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release27")
  }
}

async function insertCards(username, card, idGame) {
  const insertQuery = constants.INSERT_CARTAS_JUGADOR; //insert relation cartas y player
  const insertValues = [username, card, idGame];


  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect28");
  try {
    const insertResult = await client.query(insertQuery, insertValues);

    if (insertResult.rows.length == 0) {
      return { exito: false, msg: constants.ERROR_INSERTING };
    } else {
      //console.log("insertValues "+insertValues);
      return { exito: true, msg: constants.CORRECT_INSERT };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release28")
  }
}

/*async function insertCards(idGame, character,  cards) {
  const characters_with_usernames = await currentCharacters(idGame);
  //usernames of all players in the game order by character name

  const insertQuery = constants.INSERT_CARTAS_JUGADOR; //insert relation cartas y player
  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect");
  
  try {
    let errorEncountered = false;
    for (let i = 0; i < constants.NUM_PLAYERS && !errorEncountered; i++) {
      //iterator for each player

      for (let j = 0; j < constants.NUM_CARDS; j++) {
        // iterator for each card

        const insertValues = [cards[i][j], username]; // card and username
        await client.query(insertQuery, insertValues);

        if (insertResult.rows.length == 0) {
          // error inserting
          errorEncountered = true;
          break;
        }
      }
    }
    if (errorEncountered) {
      for (let i = 0; i < constants.NUM_PLAYERS; i++) {
        const username = characters_with_usernames.userNameOfCharacters[i]; // username of the player
        deleteCardsFromPlayer(username); //deleteCards
      }
      return { exito: false, msg: constants.ERROR_INSERTING };
    } else {

      return { exito: true, msg: constants.CORRECT_INSERT };
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
    
    if (verbose_client_release)
      console.log("cliente.release")
  }
}*/

async function deleteCardsFromPlayer(player) {
  const deleteQuery = constants.DELETE_ALL_CARDS_FROM_JUGADOR;
  const deleteValues = [player];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect30");
  try {
    await client.query(deleteQuery, deleteValues);
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release30")
  }
}

async function changeGameState(idGame, state) {
  // check if user exits and has an active game
  const updatePartidaQuery = constants.UPDATE_STATE_PARTIDA;
  //supnogo  que update tb el estado de los playerssss
  const updatePartidaValues = [idGame, state];

  const client = await pool.connect();
  if (verbose_pool_connect)
    console.log("pool connect31");
  try {
    const updatePartidaResult = await client.query(
      updatePartidaQuery,
      updatePartidaValues
    );

    if (updatePartidaResult.rows.length == 0)
      return { exito: false, msg: constants.ERROR_UPDATING };
    else return { exito: true };
  } catch (error) {
    throw error;
  } finally {
    client.release();

    if (verbose_client_release)
      console.log("cliente.release31")
  }
}


//*****************************************EXPORTS******************************************** */
module.exports = {
  createAccount,
  createBot,
  removeBots,
  getBotsInfo,
  information_for_bot,
  login,
  changePassword,
  //*****************************************CHAT*********************************************** */
  saveMsg,
  restoreMsg,
  gameExists,
  //*****************************************JUEGO******************************************** */
  createGame,
  joinGame,
  leaveGame,
  gameInformation,
  dealCards,
  availabilityCharacters,
  selectCharacter,
  stopGame,
  resumeGame,
  finishGame,
  getPlayersCharacter,
  changeTurn,
  turno_asks_for,
  acuse_to,
  isAlive,
  //****************************************player*********************************************** */
  playerInformation,
  getPlayerStateInformation,
  getPlayerXP,
  getCards,
  playerHasCard,
  update_players_info,
  updatePosition,
  getSospechasBot,
  updateTurno,
};
