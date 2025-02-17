const pool = require('../connectionManager'); 
const constants = require('../constants'); 
const { getPlayersCharacter } = require('../controller'); 

jest.mock('../connectionManager', () => ({
  connect: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue({
      rows: [
        { username: 'user1', ficha: 'mr SOPER' },
        { username: 'user2', ficha: 'miss REDES' },
      ],
    }),
    release: jest.fn(),
  }),
  end: jest.fn()
}));

describe('getPlayersCharacter', () => {
  afterAll(() => {
    pool.end();
  });
  it('should return the players and their characters if the game exists', async () => {
    const result = await getPlayersCharacter('game1');

    expect(result).toEqual({
      exito: true,
      players: [
        { userName: 'user1', character: 'mr SOPER' },
        { userName: 'user2', character: 'miss REDES' },
      ],
    });
  });

  it('should return an error message if the game does not exist', async () => {
    pool.connect.mockResolvedValueOnce({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    });

    const result = await getPlayersCharacter('game2');

    expect(result).toEqual({
      exito: false,
      msg: constants.WRONG_IDGAME,
    });
  });
});