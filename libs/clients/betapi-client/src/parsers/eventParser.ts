import _ from 'lodash'
import { Event } from '../types/event'

export default class EventParser {
  static parse(event?: object,
  ): Event {
    return {
        id: _.get(event, 'id', ''),
        time: _.get(event, 'time', ''),
        player1: _.get(event, 'home.name', ''),
        player2: _.get(event, 'away.name', '')
    }
  }
}