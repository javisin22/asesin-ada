const { spawn } = require('child_process');
const constants = require('../api/constants.js');
const N_PLAYERS = 6;

//require('dotenv').config();

const PYTHON_NAME = process.env.NODE_ENV === 'production' ? 'python3' : 'python';

const PLACES = [
  'aulas norte',
  'recepcion',
  'laboratorio',
  'escaleras',
  'biblioteca',
  'baños',
  'despacho',
  'cafeteria',
  'aulas sur']
const PEOPLE = [
  'mr SOPER',
  'miss REDES',
  'mr PROG',
  'miss FISICA',
  'mr DISCRETO',
  'miss IA']
const WEAPONS = [
  'teclado',
  'cable de red',
  'cafe envenenado',
  'router afilado',
  'troyano',
  'cd']


// luo

function createBot(me, cards) {
  console.log('Creating bot...');

  let idx_cartas = [];
  for (let i = 0; i < cards.length; i++) {
    if (PLACES.includes(cards[i])) {
      idx_cartas[i] = PLACES.indexOf(cards[i]);
      //console.log('PLACES -- card ', cards[i], ' -- idx -- ' + idx_cartas[i]);
    } else if (PEOPLE.includes(cards[i])) {
      idx_cartas[i] = PEOPLE.indexOf(cards[i]) + PLACES.length;
      //console.log('PEOPLE -- card ', cards[i], ' -- idx -- ' + idx_cartas[i]);
    } else {
      idx_cartas[i] = WEAPONS.indexOf(cards[i]) + PLACES.length + PEOPLE.length;
      //console.log('WEAPONS -- card ', cards[i], ' -- idx -- ' + idx_cartas[i]);
    }
  }

  const tarjeta = [];
  tarjeta.length = (PLACES.length + PEOPLE.length + WEAPONS.length) * N_PLAYERS;
  tarjeta.fill(50);
  
  for(let j = 0; j < (PLACES.length + PEOPLE.length + WEAPONS.length); j ++){
    tarjeta[N_PLAYERS * j + me] =  0;
  } 
  
  for (let i = 0; i < idx_cartas.length; i++) {
    //console.log('idx_cartas[i] + me * N_Pl', idx_cartas[i] + me * N_PLAYERS);
    for(let j = 0; j < N_PLAYERS; j ++){
      tarjeta[idx_cartas[i] * N_PLAYERS + j] =  0;
    }
    tarjeta[me + idx_cartas[i] * N_PLAYERS] = 100;
  }

  const strTarjeta = tarjeta.join(',');
  return strTarjeta;
}
// me == idx en la lista ordenada de jugadores
/*function createBot(me, cards) {
  console.log('Creating bot...');

  // Scar el índice de car1, card2 y card3
  for (let i = 0; i < cards.length; i++) {
    if (PLACES.indexOf(cards[i]) === -1) {
      if (PEOPLE.indexOf(cards[i]) === -1) {
        cards[i] = WEAPONS.indexOf(cards[i]) + PLACES.length + PEOPLE.length;
      } else {
        cards[i] = PEOPLE.indexOf(cards[i]) + PLACES.length;
      }
    } else {
      cards[i] = PLACES.indexOf(cards[i]);
    }
    //console.log('Card: ' + cards[i]);
  }
  // Crear un string de (N_PLACES+N_ROOMS+N_THINGS)*N_PLAYERS
  const tarjeta = [];
  for (let i = 0; i < PEOPLE.length + WEAPONS.length + PLACES.length; i++) {
    for (let j = 0; j < N_PLAYERS; j++) {
      if (i === cards[0] || i === cards[1] || i === cards[2]) {
        if(j === me) {
          tarjeta.push(100);
        } else {
          tarjeta.push(0);
        }
      } else {
        if (j === me) {
          tarjeta.push(0);
        } else {
          tarjeta.push(50);
        }
      }
    }
  }

  const strTarjeta = tarjeta.join(',');
  return strTarjeta;
}*/

async function moveBot(pjs_pos, me, dice, tarjeta, group) {
  // console.log('Moving bot...');
  // console.log('Parameters: <List of players\' positions>, <my index>, <my dice>, <my card>');

  const args = [pjs_pos, me, dice, tarjeta, group];
  
  // Ejecutar el script de Python
  const data = await move(args);
  return data;
}

async function moveBotTest(tarjeta) {
  // console.log('Moving bot...');
  // console.log('Parameters: <List of players\' positions>, <my index>, <my dice>, <my card>');

  const args2 = [[366, 265, 372, 394, 395, 289], 5, 9, tarjeta];
    
  // Ejecutar el script de Python
  const data = await move(args2);
  console.log(data.toString());
}

function move(args) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(PYTHON_NAME, ['../bot/moveBot.py', ...args]);

    pythonProcess.stdout.on('data', (data) => {
      resolve(data);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(data);
    });

    // pythonProcess.on('close', (code) => {
    //   console.log(`Proceso de Python cerrado con código ${code}`);
    // });
  });
}

async function updateCard(me, lvl, asker, holder, where, who, what, hasSmg, tarjeta) {
  // console.log('Updating card...');
  // console.log('Parameters: <me> <lvl> <asker> <holder> <where> <who> <what> <hasSmg> <card>');

  
  const args = [me, lvl, asker, holder, where, who, what, hasSmg, tarjeta];
  const data = await update(args);
  return data;
}

async function updateCardTest(tarjeta){
  // console.log('Updating card...');
  // console.log('Parameters: <me> <lvl> <asker> <holder> <where> <who> <what> <hasSmg> <card>');

  const args_lvl1 = [3, 1, 3, 1, 'biblioteca', 'miss REDES', 'troyano', 0, tarjeta];
  const args_lvl1_sordo = [3, 1, 2, 1, 'biblioteca', 'miss REDES', 'troyano', 0, tarjeta];
  const args_lvl2 = [3, 2, 2, 1, 'recepcion', 'mr SOPER', 'cd', 2, tarjeta];
  const args_lvl3 = [3, 3, 2, 1, 'recepcion', 'miss IA', 'cd', 2, tarjeta];

  // Array de argumentos para que se llegue a acusación
  const args_ac0 = [3, 3, 1, 4, 'aulas norte', 'mr SOPER', 'router afilado', 2, tarjeta];
  const args_ac1 = [3, 3, 3, 5, 'recepcion', 'miss FISICA', 'café envenenado', 1, tarjeta];
  const args_ac2 = [3, 3, 2, 1, 'aulas sur', 'mr PROG', 'troyano', 1, tarjeta];
  const args_ac3 = [3, 3, 1, 2, 'escaleras', 'mr DISCRETO', 'teclado', 0, tarjeta];
  const args_ac4 = [3, 3, 4, 2, 'biblioteca', 'mr SOPER', 'café envenenado', 2, tarjeta];
  const args_ac5 = [3, 3, 3, 0, 'laboratorio', 'miss REDES', 'cable de red', 0, tarjeta];
  const args_ac6 = [3, 3, 0, 3, 'despacho', 'miss FISICA', 'cd', 0, tarjeta];
  const args_ac7 = [3, 3, 5, 2, 'cafeteria', 'miss IA', 'router afilado', 0, tarjeta];
  const args_ac8 = [3, 3, 4, 3, 'aulas norte', 'miss REDES', 'cable de red', 0, tarjeta];
  // const args_final_bib = [3, 3, 1, 5, 'biblioteca', 'miss FISICA', 'troyano', 1, tarjeta];
  const args_final_sur = [3, 3, 0, 4, 'aulas sur', 'miss FISICA', 'router afilado', 2, tarjeta];
  const args = [args_ac0, args_ac1, args_ac2, args_ac3, args_ac4, args_ac5, args_ac6, args_ac7, args_ac8];

  // const pythonProcess = spawn('python3', ['../bot/updateCard.py', ...args_lvl3]);

  // pythonProcess.stdout.on('data', (data) => {
  //   console.log(`stdout: ${data}`);
  //   printCard(data);
  // });

  // pythonProcess.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });

  // pythonProcess.on('close', (code) => {
  //   console.log(`Proceso de Python cerrado con código ${code}`);
  // });
  card = '';
  for (let i = 0; i < args.length; i++) {
    try {
      const data = await update(args[i]);
      card = data;
      printCard(card);
      console.log('Acusación ' + i);
      if (i < args.length - 1) {
        args[i+1][8] = card;
      }
    } catch (error) {
      console.error('Error actualizando la tarjeta:', error);
      break; // Salimos del bucle si hay un error
    }
  }
  return card; 
}

function update(args) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(PYTHON_NAME, ['../bot/updateCard.py', ...args]);

    pythonProcess.stdout.on('data', (data) => {
      resolve(data);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(data);
    });

    // pythonProcess.on('close', (code) => {
    //   console.log(`Proceso de Python cerrado con código ${code}`);
    // });
  });
}

function printCard(tarjeta) {
  const card = String(tarjeta).split(',');
  let strCard = '';
  for (let i = 0; i < card.length; i++) {
    if (i === (PLACES.length * constants.NUM_PLAYERS) || 
    i === ((PLACES.length + PEOPLE.length) * constants.NUM_PLAYERS)) {
      strCard += '\n';
    }
    if (i === 0){
      strCard += 'PLACES: \n';
    }
    if (i === (PLACES.length) * constants.NUM_PLAYERS) {
      strCard += 'CHARACTERS: \n';
    }
    if (i === (PLACES.length + PEOPLE.length) * constants.NUM_PLAYERS){
      strCard += 'WEAPONS: \n';
    }
    // Añadir el nombre de la carta
    if (i < PLACES.length * constants.NUM_PLAYERS) {
      if (i % constants.NUM_PLAYERS === 0) {
        strCard += PLACES[i/constants.NUM_PLAYERS] + ': ';
      }
    } else if (i < (PLACES.length + PEOPLE.length) * constants.NUM_PLAYERS) {
      if (i % constants.NUM_PLAYERS === 0){
        strCard += PEOPLE[(i-PLACES.length*constants.NUM_PLAYERS)/constants.NUM_PLAYERS] + ': ';
      }
    } else {
      if (i % constants.NUM_PLAYERS === 0){
        strCard += WEAPONS[(i-PLACES.length*constants.NUM_PLAYERS-PEOPLE.length*constants.NUM_PLAYERS)/constants.NUM_PLAYERS] + ': ';
      }
    }
    strCard += card[i] + ' ';
    if (i % (constants.NUM_PLAYERS) === (constants.NUM_PLAYERS-1) && i !== 0) {
      strCard += '\n';
    }
  }
  console.log(strCard);
}

module.exports = {
  createBot,
  moveBot,
  moveBotTest,
  updateCard,
  updateCardTest,
  printCard
};
