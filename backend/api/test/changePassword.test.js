const { changePassword } = require('../controller.js');
const constants = require('../constants.js');
const pool = require('../connectionManager');

describe('changePassword', () => {

  afterAll(() => {
    pool.end();
  });

  test('should change password successfully', async () => {
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce({ rows: [{ passwd: "oldPassword" }] })
        .mockResolvedValueOnce({}),
      release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);
  
    let result;
    try {
      result = await changePassword('testUser', "oldPassword", "newPassword");
    } finally {
      mockClient.release();
    }
  
    expect(result).toEqual({ exito: true, msg: constants.CORRECT_CHANGE_PASSWD });
    expect(mockClient.release).toHaveBeenCalledTimes(2);
  });


  test('should return an error if old password is incorrect', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValueOnce({ rows: [{ passwd: 'wrongPassword' }] }), 
      release: jest.fn(), 
    };
  
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await changePassword('testUser', "oldPassword", "newPassword");
    } finally {
      mockClient.release();
    }
  
    expect(result).toEqual({ exito: false, msg: constants.WRONG_PASSWD }); 
    expect(mockClient.release).toHaveBeenCalledTimes(2); 
  });
});