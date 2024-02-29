const { getUsers } = require('../users');

describe('getUsers', () => {
  it('should get users collection', (done) => {
    const mockRequest = {
      query: {
        page: 1,
      },
    };
    const mockResponse = {
      json: jest.fn(),
      status: jest.fn(),
    };
    getUsers(mockRequest, mockResponse, (error) => {
      if (error) {
        done(error);
        return;
      }
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        totalItems: expect.any(Number),
        totalPages: expect.any(Number),
        currentPage: expect.any(Number),
        users: expect.any(Array),
        limit: expect.any(Number),
      });
    });
    done();
  });
});
