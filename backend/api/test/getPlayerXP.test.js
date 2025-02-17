const pool = require('../connectionManager'); 
const constants = require('../constants'); 
const { getPlayerXP } = require('../controller'); 

describe('getPlayerXP', () => {

    afterAll(() => {
        pool.end();
    });
  test('should return the player XP correctly', async () => {
    const mockClient = {
      release: jest.fn(),
      query: jest.fn().mockResolvedValue({ 
        rows: [
          { XP: 100 }
        ] 
      }),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await getPlayerXP('testUser');
    } finally {
      mockClient.release();
    }
  
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_XP_USUARIO, ['testUser']);
    expect(mockClient.release).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ 
      exito: true, 
      XP: 100
    });
  });

  test('should return an error if no player is found', async () => {
    const mockClient = {
      release: jest.fn(),
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await getPlayerXP('testUser');
    } finally {
      mockClient.release();
    }
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_XP_USUARIO, ['testUser']);
    expect(mockClient.release).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ exito: false, msg: constants.WRONG_USER });
  });
});