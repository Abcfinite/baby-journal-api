import { Player } from "../types/player"
import { SportEvent } from '../types/sportEvent';
import { parse } from 'node-html-parser'

export default class SportEventParser {
  static parse(html: string) : SportEvent[] {
    const root = parse(html);
    const matchColumns = root.getElementsByTagName("td").filter(div => div.attributes.class === "match")
    const singleOnly = matchColumns.filter(col => !col.text.includes('/'))
    const date = new Date()
    const formattedDate = date.toISOString().substring(0, 10)

    var player1: Player
    var player2: Player
    var sportEvent: SportEvent
    var sportEvents: SportEvent[] = []
    var sportEventIndex = 0

    singleOnly.forEach((playerHtml, index) => {
      if (index%2 === 0) {
        player1 = {
          name: playerHtml.text,
          url: playerHtml.querySelectorAll('a')[0].attributes['href'],
          id: '',
          country: '',
          dob: '',
          currentRanking: 0,
          highestRanking: 0,
          matchesTotal: 0,
          matchesWon: 0,
          type: '',
          previousMatches: undefined,
          parsedPreviousMatches: []
        }
      } else {
        player2 = {
          name: playerHtml.text,
          url: playerHtml.querySelectorAll('a')[0].attributes['href'],
          id: '',
          country: '',
          dob: '',
          currentRanking: 0,
          highestRanking: 0,
          matchesTotal: 0,
          matchesWon: 0,
          type: '',
          previousMatches: undefined,
          parsedPreviousMatches: []
        }

        const timeAndStage = root.querySelectorAll('.beg')[sportEventIndex].textContent

        //correct Date format : 2024-04-21T03:30:00+0200
        const eventTime = new Date(`${formattedDate}T${timeAndStage.substring(0,5)}+0200`).getTime()
        const newEventDateTime = new Date(eventTime)
        const newEventDate = newEventDateTime.toLocaleDateString(undefined, {timeZone: 'Australia/Sydney'}).replaceAll('/','.')
        const newEventTime = newEventDateTime.toLocaleTimeString(undefined, {timeZone: 'Australia/Sydney', hour12: false})

        sportEvent = {
          player1: player1,
          player2: player2,
          id: this.createId(player1, player2, newEventDate),
          url: '',
          stage: timeAndStage.substring(5),
          date: newEventDate,
          time: newEventTime,
          competitionName: '',
        }

        sportEvents.push(sportEvent)
        sportEventIndex++
      }
    })

    const h2h = root.getElementsByTagName("div").filter(div => div.attributes.class === "head2head")

    h2h.splice(0, sportEvents.length).forEach((url, index) => {
      sportEvents[index].url = url.querySelectorAll('a')[0].attributes['href']
    })

    return sportEvents
  }

  static createId(player1: Player, player2: Player, formattedDate: string) {
    const p1Name = player1.name.split(' ')[0]
    const p2Name = player2.name.split(' ')[0]
    return p1Name+'#'+p2Name+'#'+formattedDate
  }

  static parseResult(html: string) {
    const root = parse(html);
    const matchColumns = root.getElementsByTagName("td").filter(div => div.attributes.class === "match")
  }
}