const { saveMsg } = require('../controller.js');
const constants = require('../constants.js');
const pool = require('../connectionManager.js');

describe('saveMsg', () => {

  afterAll(() => {
    pool.end();
  });

  test('should save message successfully', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValueOnce({ rows: [{}] }), 
      release: jest.fn(), 
    };
    
    pool.connect = jest.fn().mockResolvedValue(mockClient);   

    let result;
    try {
      result = await saveMsg('currentTimestamp', 'group', 'isQ', 'msg', 'emisor'); 
    } finally {
      mockClient.release();
    }
    expect(result).toEqual({ exito: true, msg: constants.CORRECT_MSG }); 
    expect(mockClient.release).toHaveBeenCalledTimes(2); 

  });

  test('should return an error if message save is unsuccessful', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValueOnce({ rows: [] }), 
      release: jest.fn(),   
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient); 

    let result;
    try{
      result = await saveMsg('currentTimestamp', 'group', 'isQ', 'msg', 'emisor'); 
    } finally {
      mockClient.release();
    }

    expect(result).toEqual({ exito: false, msg: constants.WRONG_MSG }); 
    expect(mockClient.release).toHaveBeenCalledTimes(2); 
  });
});
