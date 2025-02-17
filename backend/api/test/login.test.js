const pool = require('../connectionManager'); 
const constants = require('../constants'); 
const { login, playerInformation } = require('../controller'); 

describe('login', () => {
  afterAll(() => {
    pool.end();
  });
  const playerInformation = jest.fn();
  console.log("Hola luo, estoy en login");


  test('should return the game and type if the username and password are correct', async () => {
    console.log('El hormiguero')
    const mockClient = {
      query: jest.fn().mockResolvedValue({
        rows: [{passwd: 'password1' }],
        tipo_partida: 'o',
      }),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try{
      result = await login('user1', 'password1');
      playerInformation.mockResolvedValue( result.id_partida_actual= 123456 , result.tipo_partida = 'o' );
    }
    finally{
      mockClient.release();
    }
    
    expect(result).toEqual({
      exito: true,
      id_partida_actual: 123456,
      tipo_partida: 'o',
      msg: constants.CORRECT_LOGIN,
    });
  });
  

  test('should return an error message if the username does not exist', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({
        rows: [],
      }),
      release: jest.fn(),
    };
  
    jest.spyOn(pool, 'connect').mockResolvedValue(mockClient);
  
    const result = await login('user2', 'password2');

    expect(result).toEqual({
      exito: false,
      msg: constants.WRONG_USER,
    });
  });

  test('should return an error message if the password is incorrect', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({
        rows: [{ passwd: 'password1' }],
      }),
      release: jest.fn(),
    };
  
    jest.spyOn(pool, 'connect').mockResolvedValue(mockClient);
    const result = await login('user3', 'password3');

    expect(result).toEqual({
      exito: false,
      msg: constants.WRONG_PASSWD,
    });
  });
});
