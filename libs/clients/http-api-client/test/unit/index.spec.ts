import HttpApiClient from '../..'
import { https } from 'follow-redirects'
import dns from 'dns'

jest.mock('follow-redirects', () => ({
  https: {
    request: jest.fn()
  }
}))

jest.mock('dns', () => ({
  setServers: jest.fn()
}))

describe('HttpApiClient', () => {
  describe('getNative', () => {
    it('should call https.request with correct options', async () => {
      const httpApiClient = new HttpApiClient()
      const mockResponse = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback(Buffer.from('response data'))
          }
          if (event === 'end') {
            callback()
          }
        })
      }
      const mockRequest = {
        on: jest.fn(),
        end: jest.fn()
      };
      (https.request as jest.Mock).mockImplementation((options, callback) => {
        callback(mockResponse)
        return mockRequest
      })

      const result = await httpApiClient.getNative(
        'api.b365api.com',
        '/v3/events/upcoming',
        null,
        { sport_id: '13', token: '196561-oNn4lPf9A9Hwcu' }
      )

      expect(dns.setServers).toHaveBeenCalledWith(['8.8.8.8', '8.8.4.4'])
      expect(https.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          hostname: 'api.b365api.com',
          path: encodeURI('/v3/events/upcoming?sport_id=13&token=196561-oNn4lPf9A9Hwcu'),
          headers: null,
          timeout: 20000,
          family: 4
        }),
        expect.any(Function)
      )
      expect(mockRequest.end).toHaveBeenCalled()
      expect(result).toEqual({
        status: 200,
        value: 'response data',
        statusText: '',
        hasValue: false,
        errorText: '',
        hasError: false
      })
    })

    it('should handle request error', async () => {
      const httpApiClient = new HttpApiClient()
      const mockRequest = {
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('Request error'))
          }
        }),
        end: jest.fn()
      };
      (https.request as jest.Mock).mockImplementation(() => {
        return mockRequest
      })

      await expect(httpApiClient.getNative(
        'api.b365api.com',
        '/v3/events/upcoming',
        null,
        { sport_id: '13', token: '196561-oNn4lPf9A9Hwcu' }
      )).rejects.toThrow('Request error')

      expect(mockRequest.end).toHaveBeenCalled()
    })
  })
})