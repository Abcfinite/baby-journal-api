import EventParser from '../parsers/eventParser'
import PagingParser from '../parsers/pagingParser'
import HttpApiClient from '@abcfinite/http-api-client'
import CacheService from './cache-service'
import { Event } from '../types/event'
import { EventTotal } from '@/types/eventTotal'

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

    const pageOneEvents = data['results'].map(r => {
      return new EventParser().parse(r)
    })

    // console.log('>>>>pageOneEvents')
    // console.log(pageOneEvents)


    fullEndedEvents = fullEndedEvents.concat(pageOneEvents)

    if (!fullPages) {
      if (numberOfPageTurn > 3) {
        numberOfPageTurn = 3
      }
    }

    for (let page = 0; page < numberOfPageTurn; page++) {
      // fetchPageActions.push(this.getEveryPage(page, playerId))
      fullEndedEvents = fullEndedEvents.concat(await this.getEveryPage(page, playerId, sportId))
    }


    // console.log('>>>>fetchPageActions')
    // console.log(fetchPageActions)

    // let parsedEvents: Array<Array<Event>> = await Promise.all(fetchPageActions)

    // parsedEvents.map(pe => fullEndedEvents = fullEndedEvents.concat(pe))

    await new CacheService().setPlayerCache(playerId, JSON.stringify(fullEndedEvents))

    // console.log('>>>>fullEndedEvents')
    // console.log(fullEndedEvents)

    return { matchNo: paging.total, events: fullEndedEvents }
  }

  async getEveryPage(pageNo: number, playerId: string, sportId: string) {
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