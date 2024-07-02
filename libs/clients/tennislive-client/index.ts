// manually find sport event
// fetch info on the sport event

import { Player } from './src/types/player';
import { SportEvent } from "@/types/sportEvent";
import MatchesDetailParser from "./src/parsers/matchesDetailParser";
import PlayerService from "./src/services/playerService";
import ScheduleService from "./src/services/scheduleService";
import FinishedService from './src/services/finishedService';

export default class TennisliveClient {

  constructor() {
  }

  async getPlayer(playerName?: string, playerUrl?: string) : Promise<Player>{

    let playerDetailUrl = playerUrl

    if (playerDetailUrl === null) {
      if (playerName === 'li tu') {
        playerDetailUrl = 'https://www.tennislive.net/atp/li-tu/'
      } else if (playerName === 'lin zhu') {
        playerDetailUrl = 'https://www.tennislive.net/wta/lin-zhu/'
      } else if (playerName === 'ipek oz') {
        playerDetailUrl = 'https://www.tennislive.net/wta/ipek-oz/'
      } else if (playerName === 'luca nardi') {
        playerDetailUrl = 'https://www.tennislive.net/atp/luca-nardi/'
      } else if (playerName === 'yue yuan') {
        playerDetailUrl = 'https://www.tennislive.net/wta/yue-yuan-/'
      } else {
        playerDetailUrl = await new PlayerService().getPlayerUrl(playerName)
      }

      if (playerDetailUrl === null || playerDetailUrl === undefined) return {} as any
    }

    const player = await new PlayerService().getPlayerDetailHtml(playerDetailUrl)
    new MatchesDetailParser().parse(player)

    await Promise.all(
      player.parsedPreviousMatches.map(async (prevMatch, index) => {
        let newPlayerData = null

        newPlayerData = await new PlayerService().getPlayerDetailHtml(prevMatch.player.url, false)

        if (newPlayerData !== null) {
          player.parsedPreviousMatches[index].player = newPlayerData
        } else {
          player.parsedPreviousMatches = player.parsedPreviousMatches.filter(pm => pm.date !== prevMatch.date )
        }
      })
    )

    return player
  }

  async getSchedule() : Promise<SportEvent[]> {
    const result = await new ScheduleService().getSchedule()
    return result
  }

  async getFinished() : Promise<SportEvent[]> {
    const finishedSportEvents = await new FinishedService().getFinished()

    finishedSportEvents.forEach(se => {
      se.url
    })

    return finishedSportEvents
  }
}