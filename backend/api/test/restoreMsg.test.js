const pool = require('../connectionManager'); 
const constants = require('../constants'); 
const { restoreMsg } = require('../controller'); 


describe('restoreMsg', () => {
    afterAll(() => {
        pool.end();
      });
  test('should return the messages correctly', async () => {
    const mockClient = {
      release: jest.fn(),
      query: jest.fn().mockResolvedValue({ 
        rows: [
          { contenido: 'testMessage', emisor: 'testSender', isQuestion: true, instante: 'testTimestamp' }
        ] 
      }),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await restoreMsg('testTimestamp', 'testGroup');
    } finally {
      mockClient.release();
    }
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_ALL_CONVERSACION, ['testTimestamp', 'testGroup']);
    expect(mockClient.release).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ 
      exito: true, 
      mensajes: [
        { mensaje: 'testMessage', emisor: 'testSender', esPregunta: true, instante: 'testTimestamp' }
      ] 
    });
  });

  test('should return an error if no messages are found', async () => {
    const mockClient = {
      release: jest.fn(),
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await restoreMsg('testTimestamp', 'testGroup');
    } finally {
      mockClient.release();
    }
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_ALL_CONVERSACION, ['testTimestamp', 'testGroup']);
    expect(mockClient.release).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ exito: false, msg: constants.WRONG_LDR_MSG });
  });
});