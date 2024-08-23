import { HttpResponse } from './src/types/http-response';
import * as https from 'https';
import unirest from 'unirest'
import fetch, {Headers} from 'node-fetch';
import axios, { AxiosResponse } from 'axios'

export default class HttpApiClient {

  constructor() {}

  async get(
    baseUrl: string,
    path?: string,
    headers?: {},
    params: {} = {},
  ):  Promise<HttpResponse> {
    let axiosResponse: AxiosResponse

    let response: HttpResponse = {
      value: null,
      status: null,
      statusText: null,
      hasValue: false,
      hasError: false,
      errorText: null,
    }

    try {
      // let instance = axios.create({
      //   timeout: 2500,
      //   signal: AbortSignal.timeout(25000)
      // })

      // axiosResponse = await instance.get(
      //   baseUrl+path,
      //   { headers, params }
      // )

      // let config = {
      //   method: 'get',
      //   maxBodyLength: Infinity,
      //   url: baseUrl+path,
      //   headers,
      //   params,
      // };

      // axiosResponse = await axios.request(config)

      // response.status = axiosResponse.status
      // response.value = axiosResponse.data
      // response.hasValue = axiosResponse.data !== undefined && axiosResponse.data !== null

      const esc = encodeURIComponent;
      const query = Object.keys(params).map(k => `${esc(k)}=${esc(params[k])}`).join('&')
      const completeQuery = `?${query}`

      const fetchResponse = await fetch(baseUrl+path+completeQuery, {
        headers,
        signal: AbortSignal.timeout(60000)
      })
      const body = await fetchResponse.text()

      response.status = fetchResponse.status
      response.value = body

      console.log('>>>>>>>body')
      console.log(body)

    } catch (err) {
      console.error(err)
    }

    return response
  }
}