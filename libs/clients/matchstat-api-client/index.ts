import { HttpResponse } from '@abcfinite/http-api-client/src/types/http-response'
import MatchService from './src/services/match-service'
import EventsParser from './src/parsers/events-parser'
import { Event } from './src/types/event'
import CacheService from './src/services/cache-service'

export default class MatchstatApiClient {

  constructor() {}

  getTodayMatches = async (): Promise<Array<Event>> =>{
    let completeEvents = []

    console.log('info: check events cache')
    const cacheService = new CacheService()
    const eventCache = await cacheService.getEventCache()

    if(eventCache !== undefined  && eventCache !== null) {
      console.log('info: using events cache')
      return new EventsParser().parse([JSON.parse(eventCache)])
    }

    console.log('info: start fetch events')

    const wtaEvents = await this.getMatchesBasedOnType('wta')
    completeEvents = completeEvents.concat(wtaEvents)
    console.log(`info: wta ${wtaEvents.length} events`)

    const atpEvents = await this.getMatchesBasedOnType('atp')
    completeEvents = completeEvents.concat(atpEvents)
    console.log(`info: atp ${atpEvents.length} events`)

    console.log(`info: store events to cache`)
    await cacheService.setEventCache(JSON.stringify(completeEvents))

    return completeEvents
  }

  getMatchesBasedOnType = async (type: 'wta' | 'atp' | 'itf'): Promise<Array<Event>> => {
    let resultCols: Array<Array<object>> = []
    let result: HttpResponse
    let pageNo = 1
    do {
      result = await new MatchService().getTodayMatch(type, pageNo.toString())
      resultCols.push(result.value['data'])
      pageNo++
    } while(result.value['hasNextPage'])

    const events = new EventsParser().parse(resultCols)

    return events
  }
}