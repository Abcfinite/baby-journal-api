import HttpApiClient from '@abcfinite/http-api-client'
import OddParser from '../parsers/oddParser'
import { Odds } from '../types/odds'

export default class OddService {
  getOddSummaryEventId = async (eventId: string, type: string): Promise<Odds> => {
    const httpApiClient = new HttpApiClient()
    const resultFirstPage = await httpApiClient.getNative(
      'api.b365api.com',
      '/v2/event/odds/summary',
      null,
      { event_id: eventId, token: '196561-oNn4lPf9A9Hwcu' }
    )

    const data = JSON.parse(resultFirstPage.value.toString())
    const startOdds = data['results']['Bet365']['odds']['start']

    if (type === '13') {
      return OddParser.parse(startOdds['13_1'])
    }

    return OddParser.parse(startOdds['92_1'])
  }
}
