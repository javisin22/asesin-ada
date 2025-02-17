const { createAccount } = require('../controller.js');
const constants = require('../constants.js');
const pool = require('../connectionManager.js');

describe('createAccount', () => {

  afterAll(() => {
    pool.end();
  });


  test('should create account correctly', async () => {
    const mockClient = { 
        query: jest.fn()  
            .mockResolvedValueOnce({ rows: [] })  
            .mockResolvedValueOnce({}) 
            .mockResolvedValueOnce({ rows: [{ username: 'testUser' }] }),
        release: jest.fn(), 
    };

    pool.connect = jest.fn().mockResolvedValueOnce(mockClient); 

    const username = 'testUser';
    const password = 'testPassword';
    
    let result;

    try{
        result = await createAccount(username, password); 
    }finally{
        mockClient.release();
    }
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_USER_USUARIO, [username]); 
    expect(mockClient.query).toHaveBeenCalledWith(constants.INSERT_JUGADOR, [username, null, null, null, null, "0"]); 
    expect(mockClient.query).toHaveBeenCalledWith(constants.INSERT_USUARIO, [username, password, 0, 0, 0, 0]); 
    expect(result).toEqual({ exito: true, username });
    expect(mockClient.release).toHaveBeenCalledTimes(2); 
});


  test('should return an error if username already exists', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValueOnce({ rows: [{ username: 'existingUser' }] }), 
      release: jest.fn(), 
    };
    pool.connect = jest.fn().mockResolvedValueOnce(mockClient);

    const username = 'existingUser';
    const password = 'testPassword';

    let result;
    try{
      result = await createAccount(username, password); 
    }finally{
      mockClient.release();
    }

    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_USER_USUARIO, [username]); 
    expect(result).toEqual({ exito: false, username }); 
    expect(mockClient.release).toHaveBeenCalledTimes(2);
  });
});
