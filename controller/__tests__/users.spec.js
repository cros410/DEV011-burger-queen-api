const { getUsers } = require('../users');

describe('getUsers', () => {
  it('should get users collection', (done) => {
    const mockResponse = {
      json: jest.fn(),
      status: jest.fn(),
    };
    getUsers({}, mockResponse, (error) => {
      if (error) {
        done(error);
        return;
      }
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith();
    });
    done();
  });
});
