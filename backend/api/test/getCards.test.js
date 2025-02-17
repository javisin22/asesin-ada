const { getCards } = require('../controller'); 
const constants = require('../constants'); 
const pool = require('../connectionManager'); 


describe('getCards function', () => {
    afterAll(() => {
        pool.end();
    });
  test('returns cards when player exists', async () => {
    const mockPlayer = 'player1';
    const mockIdGame = 1;

    const mockClient = {
      connect: jest.fn(),
      query: jest.fn().mockResolvedValue({
        rows: [
          { carta: 'card1' },
          { carta: 'card2' },
        ],
      }),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const result = await getCards(mockPlayer, mockIdGame);

    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_CARTAS_JUGADOR, [mockPlayer, mockIdGame]);
    expect(result).toEqual({
      exito: true,
      cards: ['card1', 'card2'],
    });
  });

  test('returns error message when player does not exist', async () => {
    const mockPlayer = 'player1';
    const mockIdGame = 1;

    const mockClient = {
      connect: jest.fn(),
      query: jest.fn().mockResolvedValue({
        rows: [],
      }),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const result = await getCards(mockPlayer, mockIdGame);

    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_CARTAS_JUGADOR, [mockPlayer, mockIdGame]);
    expect(result).toEqual({
      exito: false,
      msg: constants.WRONG_USER,
    });
  });
});