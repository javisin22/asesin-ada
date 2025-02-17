const { joinGame } = require('../controller'); 
const pool = require('../connectionManager'); 
const constants = require('../constants'); 

describe('joinGame function', () => {

    afterAll(() => {
        pool.end();
      });


  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns success when update is successful', async () => {
    const username = 'testUser';
    const idGame = '123456';
    const updateValues = [parseInt(idGame), username, constants.PLAY];
    const mockUpdateResult = { rows: [{ id: 1 }] };
    const mockClient = {
        query: jest.fn().mockResolvedValue(mockUpdateResult),
        release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await joinGame(username, idGame);
    } finally {
      mockClient.release();
    }
    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.UPDATE_PARTIDAandSTATE_JUGADOR, updateValues);
    expect(mockClient.release).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ exito: true, id_partida: idGame });
  });

  test('returns error when update fails', async () => {
    const username = 'testUser';
    const idGame = '1';
    const updateValues = [parseInt(idGame), username, constants.PLAY];
    const mockUpdateResult = { rows: [] };

    const mockClient = {
        query: jest.fn().mockResolvedValue(mockUpdateResult),
        release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await joinGame(username, idGame);
    } finally {
      mockClient.release();
    }

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.UPDATE_PARTIDAandSTATE_JUGADOR, updateValues);
    expect(mockClient.release).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ exito: false, msg: constants.ERROR_UPDATING });
  });
});