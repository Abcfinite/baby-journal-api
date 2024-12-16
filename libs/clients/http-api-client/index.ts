import { HttpResponse } from './src/types/http-response'
import axios, { AxiosResponse } from 'axios'
import { https } from 'follow-redirects'
import { IncomingMessage, OutgoingHttpHeaders, RequestOptions } from 'http'
import dns from 'dns'
import querystring from 'querystring'

export default class HttpApiClient {

  async getNative(
    baseUrl: string,
    path: string,
    headers?: OutgoingHttpHeaders,
    params: Record<string, string> = {},
  ): Promise<HttpResponse> {

    dns.setServers(['8.8.8.8', '8.8.4.4'])
    const queryParams = '?' + querystring.stringify(params)

    const options: RequestOptions = {
      'method': 'GET',
      'hostname': baseUrl,
      'path': encodeURI(path + queryParams),
      'headers': headers,
      'timeout': 20000,
      'family': 4, // Force IPv4 (or 6 for IPv6)
    }

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res: IncomingMessage) => {
        let data = ''

        // A chunk of data has been received.
        res.on('data', (chunk: Buffer) => {
          data += chunk.toString()
        })

        // The whole response has been received.
        res.on('end', () => {
          const response: HttpResponse = {
            status: res.statusCode ?? 500,
            value: data,
            statusText: '',
            hasValue: false,
            errorText: '',
            hasError: false
          }
          resolve(response)   // Resolve the promise with the full response data
        })
      })

      // Handle any potential errors
      req.on('error', (error: Error) => {
        console.error(`Error: ${error.message}`)
        reject(error)  // Reject the promise if an error occurs
      })

      // End the request
      req.end()
    })
  }

  async get(
    baseUrl: string,
    path?: string,
    headers?: object,
    params: object = {},
  ): Promise<HttpResponse> {
    let axiosResponse: AxiosResponse

    const response: HttpResponse = {
      value: null,
      status: null,
      statusText: null,
      hasValue: false,
      hasError: false,
      errorText: null,
    }


    const agent = new https.Agent({
      rejectUnauthorized: false
    })

    try {
      const instance = axios.create()
      instance.defaults.timeout = 60000

      axiosResponse = await instance.get(
        baseUrl + path,
        { httpsAgent: agent, timeout: 60000, headers, params }
      )

      response.status = axiosResponse.status
      response.value = axiosResponse.data
      response.hasValue = axiosResponse.data !== undefined && axiosResponse.data !== null
    } catch (err) {
      console.error(err)
    }

    return response
  }
}