const { information_for_bot } = require('../controller');
const constants = require('../constants');
const pool = require('../connectionManager'); 


describe('information_for_bot function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    pool.end();
    });
    
  it('should return correct information when valid idGame is provided', async () => {
    const selectResult = {
      rows: [
        { personaje: 'mr SOPER', posicion: 1, username: 'user1' },
        { personaje: 'miss REDES', posicion: 2, username: 'user2' },
      ]
    };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn()
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const idGame = 123456; 

    const result = await information_for_bot(idGame);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_INFO_PLAYERS_IN_GAME, [idGame]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(true);
    expect(result.usernames).toEqual(['user1', 'user2']);
    expect(result.positions).toEqual([1, 2]);
  });

  it('should return error message when invalid idGame is provided', async () => {
    const selectResult = { rows: [] };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn()
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const idGame = -4567; 

    const result = await information_for_bot(idGame);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_INFO_PLAYERS_IN_GAME, [idGame]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(false);
    expect(result.msg).toBe(constants.WRONG_IDGAME);
  });
});
