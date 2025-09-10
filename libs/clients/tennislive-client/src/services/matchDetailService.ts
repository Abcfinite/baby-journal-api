
import HttpApiClient from '@abcfinite/http-api-client'
import MatchDetailParser from '../parsers/matchDetailParser'
import { v4 as uuidv4 } from 'uuid'
import { MatchDetail } from '../types/matchDetail'

export default class MatchDetailService {
  async getMatchDetail(matchDetailUrl: string): Promise<MatchDetail> {
    const headers = {
      Host: 'www.tennislive.net',
      Referer: process.env.TENNISLIVE_HOST,
      'Cookie': uuidv4()
    }

    const httpApiClient = new HttpApiClient()

    let result = null

    try {
      result = await httpApiClient.getNative('www.tennislive.net',
        matchDetailUrl.replace(process.env.TENNISLIVE_HOST!, ''), headers)

    } catch (ex) {
      console.log('>>>error fetch matchDetailUrl')
      console.log(ex)
    }

    return new MatchDetailParser().parse(result.value as string)
  }
}
