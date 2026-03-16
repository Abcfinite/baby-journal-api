import { parse } from 'node-html-parser'
import { MatchDetail } from '../types/matchDetail'

export default class MatchDetailParser {

  parse(matchHtml: string): MatchDetail {
    const matchDetail = {
      date: '',
      competition: '',
      p1Name: '',
      p2Name: '',
      p1H2h: 0,
      p2H2h: 0,
    }

    const parsedMatchHtml = parse(matchHtml)

    let h2h = parsedMatchHtml.getElementsByTagName('div').find(div => div.attributes.class === 'players_h2h').text.trim()
    const playerNames = parsedMatchHtml.getElementsByTagName('div').filter(div => div.attributes.class === 'players_name').map(el => el.getElementsByTagName('a')[0].getAttribute('title'))

    if (h2h === null || h2h === undefined) {
      h2h = '0:0'
    }

    matchDetail.p1Name = playerNames[0]
    matchDetail.p2Name = playerNames[1]
    matchDetail.p1H2h = Number(h2h.split(':')[0])
    matchDetail.p2H2h = Number(h2h.split(':')[1])

    return matchDetail
  }
}
