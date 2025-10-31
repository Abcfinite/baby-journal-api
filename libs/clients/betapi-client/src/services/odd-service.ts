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
    var startOdds = data['results']['Bet365']
    if (startOdds === undefined) {
      startOdds = data['results']['CloudBet']
    }
    if (startOdds === undefined) {
      startOdds = data['results']['DraftKings']
    }
    if (startOdds === undefined) {
      startOdds = data['results']['Duelbits']
    }
    if (startOdds === undefined) {
      startOdds = data['results']['FonBet']
    }


    startOdds = startOdds['odds']['start']

    if (type === '13') {
      return OddParser.parse(startOdds['13_1'])
    }

    return OddParser.parse(startOdds['92_1'])
  }

  getPrematchOddEventId = async (eventId: string): Promise<Odds> => {

    console.log('>>>eventId : ', eventId)

    const httpApiClient = new HttpApiClient()
    const resultFirstPage = await httpApiClient.getNative(
      'api.b365api.com',
      '/v3/bet365/prematch',
      null,
      { FI: eventId, token: '196561-oNn4lPf9A9Hwcu' }
    )

    const data = JSON.parse(resultFirstPage.value.toString())
    const matchlineOdds = data['results'][0]['main']['sp']['match_lines']['odds']

    return {
      prematchOddP1: matchlineOdds.find((odd: any) => odd['header'] === '1' && odd['name'] === 'To Win').odds,
      prematchOddP2: matchlineOdds.find((odd: any) => odd['header'] === '2' && odd['name'] === 'To Win').odds,
    }
  }
}
