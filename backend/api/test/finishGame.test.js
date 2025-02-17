const { finishGame, removeBots } = require('../controller');
const constants = require('../constants');
const pool = require('../connectionManager');

describe('finishGame', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
      release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);
  });

  afterAll(() => {
    pool.end();
  });

  it('should finish the game correctly', async () => {
    const idGame = 1;
  
    let result;
    try {
      result = await finishGame(idGame);
    } finally {
      mockClient.release();
    }
  
    expect(mockClient.query).toHaveBeenCalledWith(constants.DELETE_GAME_CONVERSACION, [idGame]);
    expect(mockClient.query).toHaveBeenCalledWith(constants.DELETE_ALL_CARDS_FROM_PARTIDA, [idGame]);
    expect(mockClient.query).toHaveBeenCalledWith(constants.UPDATE_STATE_PARTIDA_FICHA_JUGADOR_WITH_PARTIDA, [idGame, constants.CERO, null, null]);
    expect(mockClient.release).toHaveBeenCalledTimes(4);
    expect(mockClient.query).toHaveBeenCalledWith(constants.DELETE_ALL_PARTIDA, [idGame]);
    expect(result).toEqual({ exito: true, msg: constants.CORRECT_DELETE });
  });
});