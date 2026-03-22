import EventParser from '../parsers/eventParser'
import PagingParser from '../parsers/pagingParser'
import HttpApiClient from '@abcfinite/http-api-client'
import CacheService from './cache-service'
import { Event } from '../types/event'
import { EventSummary } from '../types/eventSummary'
import { EventTotal } from '../types/eventTotal'
import EventSummaryParser from '../parsers/eventSummaryParser'

export default class EndedService {
  getEndedEventBasedOnPlayerId = async (playerId: string, sportId: string, fullPages = false): Promise<EventTotal> => {
    const httpApiClient = new HttpApiClient()
    const resultFirstPage = await httpApiClient.getNative(
      'api.b365api.com',
      '/v3/events/ended',
      null,
      { sport_id: sportId, token: '196561-oNn4lPf9A9Hwcu', team_id: playerId, page: '1' }
    )

    const data = JSON.parse(resultFirstPage.value.toString())
    const paging = PagingParser.parse(data['pager'])
    let numberOfPageTurn = Math.floor(paging.total / paging.perPage)

    let fullEndedEvents: Event[] = []

    if (!data['results'] || data['results'].length === 0) { 
      return null
    }

    const pageOneEvents = data['results'].map(r => {
      return new EventParser().parse(r)
    })

    fullEndedEvents = fullEndedEvents.concat(pageOneEvents)

    if (!fullPages) {
      if (numberOfPageTurn > 3) {
        numberOfPageTurn = 3
      }
    }

    for (let page = 0; page < numberOfPageTurn; page++) {
      fullEndedEvents = fullEndedEvents.concat(await this.getEveryPage(page, playerId, sportId))
    }

    await new CacheService().setPlayerCache(playerId, JSON.stringify(fullEndedEvents))

    var winEvents = fullEndedEvents.filter(e => (e.player1.id === playerId && e.player1won)|| (e.player2.id === playerId && !e.player1won))

    return { matchNo: paging.total, winCount : winEvents.length, events: fullEndedEvents }
  }

  getEndedEventBasedOnEventId = async (eventId: string, pId: string): Promise<EventSummary> => {
    const httpApiClient = new HttpApiClient()
    const result = await httpApiClient.getNative(
      'api.b365api.com',
      '/v1/event/history',
      null,
      { event_id: eventId, token: '196561-oNn4lPf9A9Hwcu' }
    )

    const data = JSON.parse(result.value.toString())

    return new EventSummaryParser().parse(pId, data['results'])
  }

  getEndedEventBasedOnEventIdRaw = async (eventId: string): Promise<any> => {
    const httpApiClient = new HttpApiClient()
    const result = await httpApiClient.getNative(
      'api.b365api.com',
      '/v1/event/history',
      null,
      { event_id: eventId, token: '196561-oNn4lPf9A9Hwcu' }
    )

    const data = JSON.parse(result.value.toString())


    return new EventSummaryParser().parseWithoutPid(eventId, data['results'])
  }


  async getEveryPage(pageNo: number, playerId: string, sportId: string) {

    console.log('>>>ended-service getEveryPage', pageNo, playerId, sportId)

    const httpApiClient = new HttpApiClient()
    const loopResult = await httpApiClient.getNative(
      'api.b365api.com',
      '/v3/events/ended',
      null,
      { sport_id: sportId, token: '196561-oNn4lPf9A9Hwcu', team_id: playerId, page: `${2 + pageNo}` }
    )

    const data = JSON.parse(loopResult.value.toString())
    const parsedEvents = data['results'].map(r => {
      return new EventParser().parse(r)
    })

    return parsedEvents
  }
}
