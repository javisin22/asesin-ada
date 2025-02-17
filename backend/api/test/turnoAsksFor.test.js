const { turno_asks_for } = require('../controller');
const constants = require('../constants');
const pool = require('../connectionManager');

describe('turno_asks_for function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    pool.end();
  });

  it('should return correct user when valid parameters are provided', async () => {
    const selectResult = {
      rows: [
        { user: 'user1', cartas: 'card1' },
        { user: 'user2', cartas: 'card2' },
      ],
    };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const idGame = 'Game1';
    const usernameQuestioner = 'user1';
    const characterCard = 'character1';
    const weaponCard = 'weapon1';
    const placeCard = 'place1';
    const usernameByOrder = ['user1', 'user2'];

    const result = await turno_asks_for(idGame, usernameQuestioner, characterCard, weaponCard, placeCard, usernameByOrder);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_DETERMINADAS_CARTAS_JUGADOR, [idGame, characterCard, weaponCard, placeCard]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(true);
    expect(result.user).toEqual('user2');
  });

  it('should return empty user when no other user has the cards', async () => {
    const selectResult = { rows: [] };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const idGame = 'Game1';
    const usernameQuestioner = 'user1';
    const characterCard = 'character1';
    const weaponCard = 'weapon1';
    const placeCard = 'place1';
    const usernameByOrder = ['user1', 'user2'];

    const result = await turno_asks_for(idGame, usernameQuestioner, characterCard, weaponCard, placeCard, usernameByOrder);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_DETERMINADAS_CARTAS_JUGADOR, [idGame, characterCard, weaponCard, placeCard]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(true);
    expect(result.user).toEqual('');
  });
});