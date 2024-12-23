import EventParser from '../parsers/eventParser'
import PagingParser from '../parsers/pagingParser'
import HttpApiClient from '@abcfinite/http-api-client'
import CacheService from './cache-service'
import { Event } from '../types/event'

export default class EndedService {
  getEndedEventBasedOnPlayerId = async (playerId: string) => {
    const httpApiClient = new HttpApiClient()
    const resultFirstPage = await httpApiClient.get(
      'https://api.b365api.com',
      '/v3/events/ended',
      null,
      { sport_id: '13', token: '196561-oNn4lPf9A9Hwcu', team_id: playerId, page: 1 }
    )

    // console.log('>>>>resultFirstPage')
    // console.log(resultFirstPage)

    const paging = PagingParser.parse(resultFirstPage.value['pager'])
    const numberOfPageTurn = Math.floor(paging.total / paging.perPage)

    let fullEndedEvents: Event[] = []

    const pageOneEvents = resultFirstPage.value['results'].map(r => {
      return new EventParser().parse(r)
    })

    // console.log('>>>>pageOneEvents')
    // console.log(pageOneEvents)


    fullEndedEvents = fullEndedEvents.concat(pageOneEvents)

    for (let page = 0; page < numberOfPageTurn; page++) {
      // fetchPageActions.push(this.getEveryPage(page, playerId))
      fullEndedEvents = fullEndedEvents.concat(await this.getEveryPage(page, playerId))
    }

    // console.log('>>>>fetchPageActions')
    // console.log(fetchPageActions)

    // let parsedEvents: Array<Array<Event>> = await Promise.all(fetchPageActions)

    // parsedEvents.map(pe => fullEndedEvents = fullEndedEvents.concat(pe))

    await new CacheService().setPlayerCache(playerId, JSON.stringify(fullEndedEvents))

    // console.log('>>>>fullEndedEvents')
    // console.log(fullEndedEvents)

    return fullEndedEvents
  }

  async getEveryPage(pageNo: number, playerId: string) {
    const httpApiClient = new HttpApiClient()
    const loopResult = await httpApiClient.get(
      'https://api.b365api.com',
      '/v3/events/ended',
      null,
      { sport_id: '13', token: '196561-oNn4lPf9A9Hwcu', team_id: playerId, page: 2 + pageNo }
    )

    const parsedEvents = loopResult.value['results'].map(r => {
      return new EventParser().parse(r)
    })

    return parsedEvents
  }
}