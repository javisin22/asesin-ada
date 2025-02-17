const express = require('express');
const constants = require('./constants.js');
const controller = require('./controller.js');

const router = express.Router();
router.use(express.json());

// Testing

router.get('/test', async(req,res) => {
  res.json({ success: true, message: "test con exito" });
});

// Users
router.post('/createAccount', async(req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const createSuccessfully = await controller.createAccount(
      username,
      password
    );
    res.json({
      success: createSuccessfully.exito,
      message: createSuccessfully.msg,
    });
    console.log(`${createSuccessfully.msg}  : ${createSuccessfully.username}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async(req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const resultadoLogin = await controller.login(username, password);
    console.log(resultadoLogin);
    res.json(resultadoLogin);
  } catch (error) {
    console.error(constants.ERROR_LOGIN, error);
    res.status(500).json({ success: false, message: constants.ERROR_LOGIN });
  }
});

router.get('/obtainXP', async(req, res) => {
  const username = req.query.username;

  try {
    const resultadoXp = await controller.getPlayerXP(username);

    if (resultadoXp.exito) {
      res.status(200).json({ success: true, XP: resultadoXp.XP });
    } else {
      res.status(404).json({ success: false, message: resultadoXp.msg });
    }
  } catch (error) {
    console.error(constants.ERROR_XP, error);
    res.status(500).json({ success: false, message: constants.ERROR_XP });
  }
});

// Game creation
// type = l->local, o->online
router.post('/createGame', async(req, res) => {
  const type = req.body.type;

  try {
    const createSuccessfully = await controller.createGame(type);
    console.log("createSuccessfully",createSuccessfully);

    res.status(200).json(createSuccessfully);
    // {
      // success: createSuccessfully.exito,
      // message: createSuccessfully.msg,
      // idGame: createSuccessfully.idGame,
    // });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/getGame', async (req, res) => {
  // console.log("getGame GET REQUEST");
  const idGame = req.query.idGame;
  try {
    const result = await controller.gameInformation(idGame);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ exito: false, message: error.message });
  }
});

router.put('/changePassword', async(req, res) => {
  const username = req.body.username;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  try {
    const createSuccessfully = await controller.changePassword(
      username,
      oldPassword,
      newPassword
    );

    res.json({
      success: createSuccessfully.exito,
      message: createSuccessfully.msg,
    });
    console.log(`${createSuccessfully.msg}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/availableCharacters', async(req, res) => {
  const idGame = req.body.idGame;
  // const idGame = 1;
  try {
    const createSuccessfully = await controller.availabilityCharacters(idGame);

    res.json(createSuccessfully);
    //true are available characters
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/characterSelected', async(req, res) => {
  const username = req.body.username;
  const character = req.body.character;

  try {
    const createSuccessfully = await controller.selectCharacter(
      username,
      character
    );

    res.json({
      success: createSuccessfully.exito,
      message: createSuccessfully.msg,
    });
    console.log(`${createSuccessfully.msg}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/*
  Example of how to use the function getPlayersCharacter: 
  array.forEach((players) => {
      console.log(`Username: ${players.userName}`);
      console.log(`Character: ${players.character}`);
  });
 */
//get: if the consult was successful, it returns the players and characters of the game 
router.get('/getNameAndCharacter', async(req, res) => {
  const idGame = req.body.id_partida;
  try {
    const createSuccessfully = await controller.getPlayersCharacter(
      idGame
    );
    if (createSuccessfully.exito) {
      res.json({
        success: createSuccessfully.exito,
        players: createSuccessfully.players ? createSuccessfully.players : [],
      });
    } else {  
      res.status(404).json({ success: false, message: createSuccessfully.msg });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.post('/leaveGame', async (req, res) => {
  const username = req.body.username;

  try {
    const createSuccessfully = await controller.leaveGame(username);

    res.json(createSuccessfully);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get('/playerInformation', async (req, res) => {
  const username = req.query.username;

  try {
    const result = await controller.playerInformation(username);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ exito: false, message: error.message });
  }
});


router.post('/removeBots', async (req, res) => {
  const idGame = req.body.idGame;
  try {
    const result = await controller.removeBots(idGame);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ exito: false, message: error.message });
  }
});

router.post('/updatePlayerInfo', async (req, res) => {

  const sospechas = req.body.sospechas;
  const username = req.body.username;
  const position = req.body.position;


  try {
    const result = await controller.update_players_info(username, sospechas, position);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ exito: false, message: error.message });
  }
});
//getPlayerStateInformation

router.get('/getPlayerStateInformation', async (req, res) => {

  const idGame = req.body.idGame;
  const username = req.body.username;


  try {
    const result = await controller.getPlayerStateInformation(idGame, username);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ exito: false, message: error.message });
  }
});

// ruta de pruebas para
router.post('/acuse_to', async (req, res) => {
  const player = 'rold';
  const idGame = 712603;
  const characterCard = 'miss REDES';
  const weaponCard = 'cafe envenenado';
  const placeCard = 'recepcion';

  try {
    const result = await controller.acuse_to(player, idGame, characterCard, weaponCard, placeCard);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error:true, message: error.message });
  }
});




module.exports = router;
