const pool = require('../connectionManager.js');
const constants = require('../constants.js'); // replace with your actual constants path
const { changeGameState } = require('../controller.js'); // replace with your actual controller path


describe('changeGameState', () => {

    afterAll(() => {
        // Cierra el pool de conexiones después de cada prueba
        pool.end();
      });

  test('should update the game state correctly', async () => {
    const mockClient = {
      release: jest.fn(),
      query: jest.fn().mockResolvedValue({ rows: [{ idGame: 1, state: 'p' }] }),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await changeGameState(1, 'p');
    } finally {
      mockClient.release();
    }

    expect(mockClient.query).toHaveBeenCalledWith(constants.UPDATE_STATE_PARTIDA, [1, 'p']);
    expect(mockClient.release).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ exito: true });
  });

  test('should return an error if the game state update failed', async () => {
    
    const mockClient = {
      release: jest.fn(),
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
        result = await changeGameState(1, 'newState');
    } finally {
        mockClient.release();
    }

    expect(mockClient.query).toHaveBeenCalledWith(constants.UPDATE_STATE_PARTIDA, [1, 'newState']);
    expect(mockClient.release).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ exito: false, msg: constants.ERROR_UPDATING });
  });
});