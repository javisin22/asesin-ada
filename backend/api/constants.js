const SOPER = 'mr SOPER';
const REDES = 'miss REDES';
const PROG = 'mr PROG';
const FISICA = 'miss FISICA';
const DISCRETO = 'mr DISCRETO';
const IA = 'miss IA';
const CHARACTERS_NAMES = [
  SOPER,
  REDES,
  PROG,
  FISICA,
  DISCRETO,
  IA,
];

const GUNS_NAMES = [
  'teclado',
  'cable de red', //db: asfixiaCableRed
  'cafe envenenado', //db: cafeEnvenenado
  'router afilado', //db: routerAfilado
  'troyano',
  'cd', //db: lanzar cd
];

const ROOMS_NAMES = [
  'cafeteria',
  'baños',
  'recepcion',
  'escaleras',
  'biblioteca',
  'laboratorio',
  'despacho',
  'aulas norte',
  'aulas sur',
];

const TYPES_CARD = [
  'personaje',
  'arma',
  'lugar'
];

//[120, 432, 561, 16, 191, 566]
// in order to get the initial positions of the characters
const INITIAL_POSTIONS = [
  120,
  432,
  561,
  16,
  191,
  566,
];

module.exports = {
  //Módulo.index
  //
  PORT: 3000,
  SERVER_TXT: "Server is running on port",
  //

  PRODUCTION_IPS: [
    "http://51.20.246.74",
    "http://ec2-51-20-246-74.eu-north-1.compute.amazonaws.com",
  ],
  DEVELOPMENT_IPS: [
    "http://localhost:5173",
    "http://10.1.64.155:5173",
    "http://localhost:4200",
    "https://pmjlrx6t-5173.uks1.devtunnels.ms",
    "https://h15hf16d-5173.uks1.devtunnels.ms",
    "https://zpmd6742-5173.uks1.devtunnels.ms",
  ],

  CONNECT: "connection",
  DISCONNECT: "disconnect",
  CHAT_MESSAGE: "chat-message",
  CHAT_RESPONSE: "chat-response",
  CHAT_TURN: "chat turn",
  USER_CONNECTED: "A user has connected.",
  USER_DISCONNECTED: "A user has disconnected.",
  CONNECTED_DB: "Connected to the database",
  DISCONNECTED_DB: "Disconnected from PostgreSQL server",

  //
  ERROR_STORE_MSG: "Error al almacenar el mensaje.",
  ERROR_LOAD_MSG: "Error al cargar mensaje.",
  ERROR_DATA_BASE: "Error connecting to the database:",
  ERROR_LOGIN: "Error en el servidor al realizar el inicio de sesión",
  ERROR_XP: "Error en el servidor al obtener XP",

  //
  ALLOW_ORIGIN: "Access-Control-Allow-Origin",
  ALLOW_METHODS: "Access-Control-Allow-Methods",
  ALLOW_HEADERS: "Access-Control-Allow-Headers",
  METHODS: "GET, POST, PUT, DELETE",
  HEADERS: "Content-Type",
  SIGINT: "SIGINT",

  // tipos de la partida
  LOCAL: "l",
  ONLINE: "o",

  // estados de la partida
  NOT_STARTED: "0",
  PLAY: "1",
  PAUSE: "p",

  CERO: "0",
  MENOS: "-",
  MAS: "+",

  //Personajes
  CHARACTERS_NAMES,
  SOPER,
  REDES,
  PROG,
  FISICA,
  DISCRETO,
  IA,

  //Armas
  GUNS_NAMES,

  //Habitaciones
  ROOMS_NAMES,

  //Tipos de cartas
  TYPES_CARD,

  //Posiciones iniciales
  INITIAL_POSTIONS,

  NUM_PLAYERS: CHARACTERS_NAMES.length,
  NUM_CARDS:
    CHARACTERS_NAMES.length +
    GUNS_NAMES.length +
    ROOMS_NAMES.length -
    3 / CHARACTERS_NAMES.length,

  //Módulo.controller
  WRONG_PASSWD: "La contraseña introducida es incorrecta.",
  WRONG_USER: "El usuario introducido es incorrecto.",
  WRONG_MSG: "El mensaje no se ha almacenado correctamente.",
  WRONG_LDR_MSG: "No se han restaurado mensajes",
  CORRECT_LOGIN: "Se ha iniciado sesión correctamente.",
  CORRECT_CHANGE_PASSWD: "La constraseña ha sido actualizada con exito.",
  CORRECT_MSG: "El mensaje se ha almacenado correctamente.",
  CORRECT_DELETE: "Partida eliminada correctamente.",

  //
  ERROR_UPDATING: "Error al actualizar.",
  ERROR_INSERTING: "Error al realizar la insercción.",
  ERROR_DELETING: "Error al eliminar.",
  ERROR_ASESINO: "No se ha obtenido ningun asesino.",
  ERROR_ARMA: "No se ha obtenido ningun arma.",
  ERROR_LUGAR: "No se ha obtenido ningun lugar.",

  //Múdlo.controller__Querys
  //-------insert-------
  INSERT_JUGADOR:
    'INSERT INTO grace_hopper."jugador" (username, ficha, partida_actual, sospechas, posicion, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING username',
  INSERT_USUARIO:
    'INSERT INTO grace_hopper."usuario" (username, passwd, "XP", n_ganadas_online, n_ganadas_local, n_jugadas) VALUES ($1, $2, $3, $4, $5, $6) RETURNING username',
  INSERT_BOT:
    'INSERT INTO grace_hopper."bot" (username, nivel_dificultad) VALUES ($1, $2) RETURNING username',
  INSERT_CONVERSACION:
    'INSERT INTO grace_hopper."conversacion" (instante, "isQuestion", partida, contenido, emisor) VALUES ($1, $2, $3, $4, $5) RETURNING emisor',
  INSERT_PARTIDA:
    'INSERT INTO grace_hopper."partida" (id_partida, estado, fecha_ini, tipo, turno , asesino, arma , lugar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_partida',
  INSERT_CARTAS_JUGADOR:
    'INSERT INTO grace_hopper."cartas_jugador" ("jugador", "carta", "partida") VALUES ($1, $2, $3) RETURNING "jugador"',

  //-------select-------
  SELECT_USER_USUARIO:
    'SELECT username FROM grace_hopper."usuario" WHERE username = $1',
  SELECT_PASSWD_USUARIO:
    'SELECT passwd FROM grace_hopper."usuario" WHERE username = $1',
  SELECT_XP_USUARIO:
    'SELECT "XP" FROM grace_hopper."usuario" WHERE username = $1',
  SELECT_ALL_CONVERSACION:
    'SELECT contenido,emisor,"isQuestion",instante FROM grace_hopper."conversacion" WHERE  instante <= $1 AND partida = $2 ORDER BY instante',
  SELECT_PARTIDAandSTATE_JUGADOR:
    'SELECT partida, estado FROM grace_hopper."jugador" WHERE username = $1',
  SELECT_ID_PARTIDA:
    'SELECT id_partida FROM grace_hopper."partida" WHERE id_partida = $1',
  SELECT_NOMBRE_TYPE:
    'SELECT nombre FROM grace_hopper."cartas" WHERE tipo=$2 ORDER BY RANDOM() LIMIT 1',
  SELECT_NOMBRE_ASESINO:
    'SELECT nombre FROM grace_hopper."personajes" ORDER BY RANDOM() LIMIT 1',
  SELECT_NOMBRE_ARMA:
    'SELECT nombre FROM grace_hopper."arma" ORDER BY RANDOM() LIMIT 1',
  SELECT_NOMBRE_LUGAR:
    'SELECT nombre FROM grace_hopper."lugar" ORDER BY RANDOM() LIMIT 1',
  SELECT_FICHA_JUGADOR:
    'SELECT ficha, username FROM grace_hopper."jugador" WHERE partida_actual = $1',
  SELECT_USERNAME_JUGADOR:
    'SELECT username FROM grace_hopper."jugador" WHERE partida_actual = $1 AND ficha = $2',
  SELECT_CARTAS_JUGADOR:
    'SELECT carta FROM grace_hopper."cartas_jugador" WHERE "jugador" = $1 AND "partida" = $2',
  SELECT_CARTAS_DISTINT_SOLUTION:
    "SELECT " +
    "  cartas.nombre AS cards " +
    "FROM " +
    '  grace_hopper."cartas" cartas ' +
    "JOIN " +
    '  grace_hopper."partida" game ON cartas.nombre != game.asesino and cartas.nombre != game.arma and cartas.nombre != game.lugar and game.id_partida = $1',
  SELECT_INFO_JUGADOR:
    "SELECT " +
    "  player.ficha AS ficha, " +
    "  player.partida_actual AS id_partida, " +
    "  player.sospechas AS sospechas, " +
    "  player.posicion AS posicion, " +
    "  player.estado AS estado, " +
    "  useri.n_jugadas AS n_jugadas, " +
    "  useri.n_ganadas_local AS n_ganadas_local, " +
    "  useri.n_ganadas_online AS n_ganadas_online, " +
    '  useri."XP" AS XP, ' +
    "  game.estado AS estado_partida, " +
    "  game.tipo AS tipo_partida " +
    "FROM " +
    '  (grace_hopper."jugador" player ' +
    "JOIN " +
    '  grace_hopper."usuario" useri ON player.username = useri.username ' +
    "JOIN " +
    '  grace_hopper."partida" game ON player.partida_actual = game.id_partida) ' +
    "WHERE " +
    " player.username = $1",
  SELECT_SOLUTION:
    'SELECT id_partida FROM grace_hopper."partida" WHERE id_partida = $1 ' +
    "AND asesino = $2 AND arma = $3 AND lugar = $4",
  SELECT_INFO_GAME:
    'SELECT estado, fecha_ini, tipo, turno FROM grace_hopper."partida" WHERE id_partida = $1',
  SELECT_CARTA_JUGADOR:
    'SELECT carta, jugador FROM grace_hopper."cartas_jugador" WHERE jugador = $1 AND carta = $2 AND partida = $3',
  SELECT_TURN_PARTIDA:
    'SELECT turno FROM grace_hopper."partida" WHERE id_partida = $1',
  SELECT_DETERMINADAS_CARTAS_JUGADOR:
    "SELECT " +
    "  carta AS cartas, " +
    "  jugador AS user  " +
    "FROM " +
    '   grace_hopper."cartas_jugador" ' +
    "WHERE " +
    " (carta=$2 OR carta=$3 OR carta=$4 )AND partida = $1",
  SELECT_TYPE_GAME:
    'SELECT tipo FROM grace_hopper."partida" WHERE id_partida = $1',
  SELECT_INFO_END_GAME:
    "SELECT " +
    "  bot.nivel_dificultad AS nivel, " +
    "  COUNT(*) AS n_bots " +
    " FROM " +
    '   grace_hopper."jugador" player' +
    " JOIN " +
    '   grace_hopper."bot" bot ON player.username = bot.username ' +
    " WHERE " +
    "   player.partida_actual = $1" +
    " GROUP BY " +
    " bot.nivel_dificultad" +
    " ORDER BY " +
    " bot.nivel_dificultad;",
  SELECT_VALID_TURN_PARTIDA:
    ' SELECT COUNT(*) AS n from grace_hopper."jugador" WHERE partida_actual = $1 AND ficha = $2 ',
  SELECT_POSICION_JUGADOR:
    " SELECT " +
    " player.ficha AS ficha, " +
    " player.posicion AS posicion, " +
    " game.turno AS turno " +
    ' FROM grace_hopper."jugador" player ' +
    ' JOIN grace_hopper."partida" game ON game.id_partida = player.partida_actual ' +
    " WHERE partida_actual = $1",
  SELECT_INFO_BOTS:
    "SELECT " +
    "player.sospechas AS sospechas, " +
    "player.ficha AS personaje, " +
    "bot.nivel_dificultad AS level  " +
    'FROM grace_hopper."jugador" player ' +
    'JOIN grace_hopper."bot" bot ON player.username = bot.username ' +
    "WHERE partida_actual = $1",
  SELECT_INFO_PLAYERS_IN_GAME:
    " SELECT " +
    " player.posicion AS posicion, " +
    " player.ficha AS personaje, " +
    " player.username AS username " +
    ' FROM grace_hopper."jugador" player ' +
    " WHERE partida_actual = $1",
  SELECT_SOSPECHAS_BOT:
    " SELECT " +
    " player.sospechas AS sospechas " +
    ' FROM grace_hopper."jugador" player ' +
    " WHERE player.username = $1",
  SELECT_JUGADORES_PARTIDA:
    ' SELECT ' +
    ' player.username AS n_players ' +
    ' FROM grace_hopper."usuario" ' +
    ' JOIN grace_hopper."jugador" player ON grace_hopper."usuario".username = player.username ' +
    ' WHERE player.partida_actual =  $1 ',

  //-------update-------;
  UPDATE_PASSWD_USUARIO:
    'UPDATE grace_hopper."usuario" SET  passwd = $2 WHERE username = $1',
  UPDATE_STATE_PARTIDA:
    'UPDATE grace_hopper."partida" SET estado = $2 WHERE id_partida = $1',
  UPDATE_FICHA_JUGADOR:
    'UPDATE grace_hopper."jugador" SET ficha = $2 WHERE username = $1 RETURNING *',
  UPDATE_PARTIDAandSTATE_JUGADOR:
    'UPDATE grace_hopper."jugador" SET  partida_actual = $1, estado = $3 WHERE username = $2',
  UPDATE_PARTIDAandSTATEandCHAR_JUGADOR:
    'UPDATE grace_hopper."jugador" SET  partida_actual = $1, estado = $3, ficha = $4, sospechas = $5 ' + 
    ' WHERE username = $2 RETURNING *',
  UPDATE_STATE_JUGADOR:
    'UPDATE grace_hopper."jugador" SET estado = $2 WHERE username = $1',
  UPDATE_STATE_PARTIDA_FICHA_JUGADOR_WITH_PARTIDA:
    'UPDATE grace_hopper."jugador" SET estado = $2, partida_actual = $3, ficha = $4 WHERE partida_actual = $1',
  UPDATE_TURNO_PARTIDA:
    'UPDATE grace_hopper."partida" SET turno = $2 WHERE id_partida = $1',
  UPDATE_SOSPECHAS_POSITION:
    'UPDATE grace_hopper."jugador" SET sospechas = $2, posicion = $3 WHERE username = $1',
  UPDATE_POSTION_PLAYER:
    'UPDATE grace_hopper."jugador" SET posicion = $2 WHERE username = $1',
  UPDATE_SOSPECHAS:
    'UPDATE grace_hopper."jugador" SET sospechas = $2 WHERE username = $1',
  UPDATE_WIN_JUGADOR_LOCAL:
    'UPDATE grace_hopper."usuario" SET n_ganadas_local = n_ganadas_local + 1, "XP" = "XP" + $2 WHERE username = $1',
  UPDATE_WIN_JUGADOR_ONLINE:
    'UPDATE grace_hopper."usuario" SET n_ganadas_online = n_ganadas_online + 1, "XP" = "XP" + $2 WHERE username = $1',

  //-------delete------
  DELETE_GAME_CONVERSACION:
    'DELETE FROM grace_hopper."conversacion" WHERE "partida" = $1',
  DELETE_ALL_PARTIDA:
    'DELETE FROM grace_hopper."partida" WHERE id_partida = $1',
  DELETE_ALL_CARDS_FROM_JUGADOR:
    'DELETE FROM grace_hopper."cartas_jugador" WHERE jugador = $1',
  DELETE_ALL_CARDS_FROM_PARTIDA:
    'DELETE FROM grace_hopper."cartas_jugador" WHERE partida = $1',
  DELETE_ALL_BOTS_FROM_BOT:
    'DELETE FROM grace_hopper."bot" ' +
    "WHERE username IN ( " +
    'SELECT username FROM grace_hopper."jugador" ' +
    "WHERE partida_actual = $1 ) " +
    "RETURNING username ",
  DELETE_ALL_BOTS_FROM_JUGADOR:
    'DELETE FROM grace_hopper."jugador" ' +
    "WHERE username LIKE 'bot%' AND partida_actual = $1",

  // DELETE FROM grace_hopper."bot"
  // WHERE username IN (
  // SELECT username FROM grace_hopper."jugador"
  // WHERE partida_actual = 221718

  /*DELETE FROM tabla1
WHERE columna1 IN (
    SELECT columna1
    FROM tabla1
    INNER JOIN tabla2 ON tabla1.columna2 = tabla2.columna2
    WHERE condiciones_de_filtrado
);
 */

  //Módulo.controller
  WRONG_PASSWD: "La contraseña introducida es incorrecta.",
  WRONG_USER: "El usuario introducido es incorrecto.",
  WRONG_IDGAME: "La partida introducida no existe.",
  WRONG_MSG: "El mensaje no se ha almacenado correctamente.",
  WRONG_LDR_MSG: "No se han restaurado mensajes",
  WRONG_ACUSE: "La acusación no es correcta.",
  CORRECT_LOGIN: "Se ha iniciado sesión correctamente.",
  CORRECT_CHANGE_PASSWD: "La constraseña ha sido actualizada con exito.",
  CORRECT_MSG: "El mensaje se ha almacenado correctamente.",
  CORRECT_DELETE: "Partida eliminada correctamente.",
  CORRECT_ACUSE: "Acusación correcta.",
  CORRECT_UPDATE: "Actualización correcta.",
  CORRECT_INSERT: "Insercción correcta.",
  WIN: "¡Has ganado la partida!",
  FAIL: "Acusación incorrecta. ¡Has perdido la partida!",

  //
  ERROR_UPDATING: "Error al actualizar.",
  ERROR_INSERTING: "Error al realizar la insercción.",
  ERROR_DELETING: "Error al eliminar.",
  ERROR_ASESINO: "No se ha obtenido ningun asesino.",
  ERROR_ARMA: "No se ha obtenido ningun arma.",
  ERROR_LUGAR: "No se ha obtenido ningun lugar.",
};
