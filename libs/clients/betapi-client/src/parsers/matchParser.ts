import { Match } from '../types/betApiEvent'
import { Player } from '../types/betApiEvent'
import { League } from '../types/betApiEvent'
import _ from 'lodash'

export const parseMatch = (match: any): Match => {
  const home = _.get(match, 'home', {}) as Player
  const away = _.get(match, 'away', {}) as Player
  const league = _.get(match, 'league', {}) as League

  return {
    id: _.get(match, 'id', ''),
    sport_id: _.get(match, 'sport_id', ''),
    league: league,
    home: home,
    away: away,
    time: _.get(match, 'time', ''),
    ss: _.get(match, 'ss', ''),
    time_status: _.get(match, 'time_status', ''),
  }
}
