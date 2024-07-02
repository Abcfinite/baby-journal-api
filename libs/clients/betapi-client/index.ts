import PagingParser from './src/parsers/pagingParser';
import HttpApiClient from '../http-api-client'
import { Event } from './src/types/event';

export default class BetapiClient {

  constructor() {
  }

  async getEvents() : Promise<Array<Event>>{
    const httpApiClient = new HttpApiClient()
    const result = await httpApiClient.get(
      'https://api.b365api.com',
      '/v1/bet365/upcoming?sport_id=13&token=196561-yXe5Z8ulO9UAvk&day=20240703'
    )

    const paging = PagingParser.parse(result.value['pager'])


    const numberOfPageTurn = Math.floor(paging.total / paging.perPage)

    console.log('>>>>>numberOfPageTurn')
    console.log(numberOfPageTurn)


    return []
  }
}