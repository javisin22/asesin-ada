const pool = require('../connectionManager'); 
const constants = require('../constants'); 
const {playerHasCard} = require('../controller')

jest.mock('../connectionManager', () => ({
  connect: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue({
      rows: [
        { carta: 'card1', player: 'mr SOPER' },
      ],
    }),
    release: jest.fn(),
  }),
  end: jest.fn()
}));

describe('playerHasCard', () => {
  
  afterAll(() => {
    pool.end();
  });

  it('should return the card and player if the player has the card', async () => {
    const result = await playerHasCard('mr SOPER', 'card1', 123456);

    expect(result).toEqual({
      exito: true,
      card: 'card1',
      player: 'mr SOPER',
    });
  });

  it('should return an error message if the player does not have the card', async () => {
    pool.connect.mockResolvedValueOnce({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    });

    const result = await playerHasCard('miss REDES', 'card2', 123456);

    expect(result).toEqual({
      exito: false,
      msg: constants.WRONG_USER,
    });
  });
});