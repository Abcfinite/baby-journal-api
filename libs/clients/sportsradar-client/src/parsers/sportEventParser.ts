import _ from 'lodash'
import { SportEvent } from '../types/sportEvent'
import { Player } from '../types/player'

export default class SportEventParser {
  static parse(bodyJson?: object): SportEvent {
    const sportEvent = _.get(bodyJson, 'sport_event', {})
    const player1Json = _.get(bodyJson, 'sport_event.competitors[0]', {})
    const player2Json = _.get(bodyJson, 'sport_event.competitors[1]', {})
    const competitionJson = _.get(bodyJson, 'sport_event.sport_event_context.competition', {})

    const player1 : Player = {
      id: _.get(player1Json, 'id', 'player-id-needed'),
      name: '',
      age: '',
      currentRanking: 1000,
      highestRanking: 1000,
      total: 0,
      won: 0,
      previousMatches: [],
    }

    const player2 : Player = {
      id: _.get(player2Json, 'id', 'player-id-needed'),
      name: '',
      age: '',
      currentRanking: 1000,
      highestRanking: 1000,
      total: 0,
      won: 0,
      previousMatches: [],
    }

    return {
      id: _.get(sportEvent, 'id', 'no-id'),
      date: _.get(sportEvent, 'start_time', ''),
      competitionName: _.get(competitionJson, 'name', ''),
      player1: player1,
      player2: player2
    }
  }
}