const { gameExists } = require('../controller'); 
const pool = require('../connectionManager'); 
const constants = require('../constants'); 


describe('gameExists', () => {
    afterAll(() => {
        pool.end();
      });
  test('should return true if user exists and is playing a game', async () => {
    const username = 'testUser';
    const mockClient = {
      connect: jest.fn(),
      query: jest.fn().mockResolvedValue({ rows: [{ estado: 'playing', partida: 1 }] }),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await gameExists(username);
    } finally {
      mockClient.release();
    }

    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_PARTIDAandSTATE_JUGADOR, [username]); 
    expect(result).toEqual({ exito: true, id_partida: 1 }); 
    expect(mockClient.release).toHaveBeenCalledTimes(2);

    });

  test('should return false if user does not exist', async () => {
    const username = 'nonexistentUser';
    const mockClient = {
      connect: jest.fn(),
      query: jest.fn().mockResolvedValue({ rows: [] }), 
      release: jest.fn(),
    };
     pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await gameExists(username);
    } finally {
      mockClient.release();
    }
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_PARTIDAandSTATE_JUGADOR, [username]); 
    expect(result).toEqual({ exito: false, msg: constants.WRONG_USER }); 
    expect(mockClient.release).toHaveBeenCalledTimes(2);

    });
});