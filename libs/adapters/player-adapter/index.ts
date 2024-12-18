import _ from "lodash"
import TennisliveClient from '@abcfinite/tennislive-client'
import MatchAdapter from '@abcfinite/match-adapter'
import {
  getHigherRanking, getRankingDiff,
  winPercentage, wonL20, wonL10, wonL5, lostToLowerRanking,
  lostToLowerRankingThanOpponent, winFromHigherRankingThanOpponent,
  winfromHigherRanking
} from './src/utils/comparePlayer';
import { playerNamesToSportEvent, SportEvent } from "@abcfinite/tennislive-client/src/types/sportEvent";
import BetapiClient from "../../clients/betapi-client";
import { Player } from "@abcfinite/tennislive-client/src/types/player";

export default class PlayerAdapter {
  async checkPlayer(player1Name: string, player2Name: string, player1Odd: number, Player2Odd: number) {
    const sportEvent = playerNamesToSportEvent('', player1Name, '', '', player2Name, '')
    const result = await this.matchesSummary(sportEvent, player1Odd, Player2Odd)

    result.analysis = await new MatchAdapter().similarMatch(result)

    return result
  }

  async checkSportEvent(sportEvent: SportEvent) {
    // const result = await this.matchesSummaryBySportEvent(sportEvent)
    const result = await this.matchesSummary(sportEvent, 1, 1.1)

    // bet-api temporary
    // console.log(`>>bet-api temporary>>${sportEvent.player1.id}>>>>${sportEvent.player1.name}>>>${sportEvent.player2.id}>>>${sportEvent.player2.name}`)
    // await new BetapiClient().getPlayerEndedMatches(sportEvent.player1.id)
    // await new BetapiClient().getPlayerEndedMatches(sportEvent.player2.id)

    result.analysis = await new MatchAdapter().similarMatch(result)

    return result
  }

  async matchesSummaryBySportEvent(sportEvent: SportEvent) {
    const tennisLiveClient = new TennisliveClient()
    const player1 = await tennisLiveClient.getPlayer(sportEvent.player1.url)
    const player2 = await tennisLiveClient.getPlayer(sportEvent.player2.url)
    var p10match = {}
    var p20match = {}

    const date = new Date();
    const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    const result = {
      id: sportEvent.id,
      winner: 0,
      type: player1.type,
      time: sportEvent.time,
      stage: sportEvent.stage,
      date: formattedDate,
      analysis: {},
      higherRanking: getHigherRanking(player1, player2),
      rankingDifferent: getRankingDiff(player1, player2),
      winPercentage: winPercentage(player1, player2),
      wonL5: wonL5(player1, player2),
      wonL10: wonL10(player1, player2),
      wonL20: wonL20(player1, player2),
      lostToLowerRanking: lostToLowerRanking(player1, player2),
      lostToLowerRankingThanOpponent: lostToLowerRankingThanOpponent(player1, player2),
      winfromHigherRanking: winfromHigherRanking(player1, player2),
      winFromHigherRankingThanOpponent: winFromHigherRankingThanOpponent(player1, player2),
      odds: {
        player1: 1,
        player2: 1.1
      },
      player1: player1,
      player2: player2
    }

    return result
  }

  currentTournament(player1: Player, player2: Player) {
    if (player1.parsedPreviousMatches[0].tournament === player2.parsedPreviousMatches[0].tournament) {
      return player1.parsedPreviousMatches[0].tournament
    }
    else return 'not on the same tournament'
  }

  async matchesSummary(sportEvent: SportEvent, player1Odd: number, Player2Odd: number) {
    const tennisLiveClient = new TennisliveClient()

    console.log('>>>>matchesSummary')
    console.log(`>>name :  ${sportEvent.player1.name} url: ${sportEvent.player1.url}`)
    console.log(`>>name :  ${sportEvent.player2.name} url: ${sportEvent.player2.url}`)

    const player1 = await tennisLiveClient.getPlayer(sportEvent.player1.url)
    const player2 = await tennisLiveClient.getPlayer(sportEvent.player2.url)
    // const currentMatch = await tennisLiveClient.getMatchDetail(sportEvent.player2.url)

    const result = {
      id: sportEvent.id,
      type: player1.type,
      date: sportEvent.date,
      time: sportEvent.time,
      tournament: this.currentTournament(player1, player2),
      stage: sportEvent.stage,
      analysis: {},
      higherRanking: getHigherRanking(player1, player2),
      rankingDifferent: getRankingDiff(player1, player2),
      winPercentage: winPercentage(player1, player2),
      wonL5: wonL5(player1, player2),
      wonL10: wonL10(player1, player2),
      wonL20: wonL20(player1, player2),
      lostToLowerRanking: lostToLowerRanking(player1, player2),
      lostToLowerRankingThanOpponent: lostToLowerRankingThanOpponent(player1, player2),
      winfromHigherRanking: winfromHigherRanking(player1, player2),
      winFromHigherRankingThanOpponent: winFromHigherRankingThanOpponent(player1, player2),
      odds: {
        player1: player1Odd,
        player2: Player2Odd
      },
      player1: player1,
      player2: player2
    }

    return result
  }
}