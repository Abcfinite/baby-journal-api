import { Player } from "@abcfinite/tennislive-client/src/types/player";
import PlayerAdapter from "../../../player-adapter";
import _ from "lodash";
import S3ClientCustom from "@abcfinite/s3-client-custom";

export default class Analysis {
  async previousPlayersBenchmark(player1: Player, player2: Player) {

    const playerLabels = {
      player1: this.playerLabel(player1),
      player2: this.playerLabel(player2)
    }


    /// p1 vs p1 won
    let result = await new PlayerAdapter().matchesSummary(
      player1.name,
      playerLabels.player1.lastWon.player.name,
      1, 1)

    const p1_v_p1won = {
      p1: result.winFromHigherRankingThanOpponent.player1.number - result.lostToLowerRankingThanOpponent.player1.number,
      p1Won: result.winFromHigherRankingThanOpponent.player2.number - result.lostToLowerRankingThanOpponent.player2.number
    }


    /// p2 vs p1 won
    result = await new PlayerAdapter().matchesSummary(
      player2.name,
      playerLabels.player1.lastWon.player.name,
      1, 1)

    const p2_v_p1won = {
      p2: result.winFromHigherRankingThanOpponent.player1.number - result.lostToLowerRankingThanOpponent.player1.number,
      p1Won: result.winFromHigherRankingThanOpponent.player2.number - result.lostToLowerRankingThanOpponent.player2.number
    }

    /// p2 vs p2 won
    result = await new PlayerAdapter().matchesSummary(
      player2.name,
      playerLabels.player2.lastWon.player.name,
      1, 1)

    const p2_v_p2won = {
      p2: result.winFromHigherRankingThanOpponent.player1.number - result.lostToLowerRankingThanOpponent.player1.number,
      p2Won: result.winFromHigherRankingThanOpponent.player2.number - result.lostToLowerRankingThanOpponent.player2.number
    }

    /// p1 vs p2 won
    result = await new PlayerAdapter().matchesSummary(
      player1.name,
      playerLabels.player2.lastWon.player.name,
      1, 1)

    const p1_v_p2won = {
      p1: result.winFromHigherRankingThanOpponent.player1.number - result.lostToLowerRankingThanOpponent.player1.number,
      p2Won: result.winFromHigherRankingThanOpponent.player2.number - result.lostToLowerRankingThanOpponent.player2.number
    }

    return {
      players: {
        p1LastWon: playerLabels.player1.lastWon.player.name,
        p2LastWon: playerLabels.player2.lastWon.player.name
      },
      numbers: {
        p1_v_p1won,
        p2_v_p1won,
        p2_v_p2won,
        p1_v_p2won
      },
    }
  }

  playerLabel(player: Player) {
    const lastWonMatch = player.parsedPreviousMatches.filter(match => match.result === 'win')[0]
    const lastLostMatch = player.parsedPreviousMatches.filter(match => match.result === 'lost')[0]

    return {
      lastWon: lastWonMatch,
      lastLost: lastLostMatch,
    }
  }

  async knn(player1: Player, player2: Player, players: {}, wlRanking: {}) {
    const finishedHtmlfileList = await new S3ClientCustom().getFileList('tennis-match-finished')

    const isPlayer1AvgRankingHigher = Analysis.avgRanking(player1.currentRanking, player1.highestRanking) >
      Analysis.avgRanking(player2.currentRanking, player2.highestRanking)
    const isPlayer1WlRankingHigher = wlRanking['player1'] > wlRanking['player2']

    const distances = await Promise.all(
      finishedHtmlfileList.map( async file => {
        const content = await new S3ClientCustom().getFile('tennis-match-finished', file)
        const contentJson = JSON.parse(content)

        let distance = 1000000

        let correctWlRanking = false
        if (contentJson['analysis'] !== null && contentJson['analysis'] !== undefined) {
          const p1Gap = Math.abs(players['player-1'] - contentJson['analysis']['winLoseScore']['player-1'])
          const p2Gap = Math.abs(players['player-2'] - contentJson['analysis']['winLoseScore']['player-2'])
          distance = Math.hypot(p1Gap, p2Gap)

          correctWlRanking = contentJson['analysis']['winLoseRanking']['player1'] < contentJson['analysis']['winLoseRanking']['player2']
          if (isPlayer1WlRankingHigher) {
            correctWlRanking = contentJson['analysis']['winLoseRanking']['player1'] > contentJson['analysis']['winLoseRanking']['player2']
          }
        }

        let correctRanking = Analysis.avgRanking(contentJson['player1']['currentRanking'], contentJson['player1']['highestRanking']) <
        Analysis.avgRanking(contentJson['player2']['currentRanking'], contentJson['player2']['highestRanking'])
        if (isPlayer1AvgRankingHigher) {
          correctRanking = Analysis.avgRanking(contentJson['player1']['currentRanking'], contentJson['player1']['highestRanking']) >
            Analysis.avgRanking(contentJson['player2']['currentRanking'], contentJson['player2']['highestRanking'])
        }

        return {id: file, distance: distance, correctRanking: correctRanking, correctWlRanking: correctWlRanking}
      })
    )

    return  distances.filter(dis => dis.correctRanking === true && dis.correctWlRanking === true).sort((a, b) => {
      return a.distance - b.distance
    }).splice(0,3)
  }

  static avgRanking(currentRanking: number, highestRanking: number) {
    return highestRanking + ((currentRanking - highestRanking)/4)
  }

  getGap(sportEventAnalysis: {}) {
    const wlP1 = _.get(sportEventAnalysis, 'winLoseRanking.player1', 0)
    const wlP2 = _.get(sportEventAnalysis, 'winLoseRanking.player2', 0)

    const gap = Math.abs(wlP1 - wlP2)

    const p1vp1wonp1 = _.get(sportEventAnalysis, 'benchmarkPlayer.previousPlayers.numbers.p1_v_p1won.p1', 0)
    const p2vp1wonp2 = _.get(sportEventAnalysis, 'benchmarkPlayer.previousPlayers.numbers.p2_v_p1won.p2', 0)
    const p2vp2wonp2 = _.get(sportEventAnalysis, 'benchmarkPlayer.previousPlayers.numbers.p2_v_p2won.p2', 0)
    const p1vp2wonp1 = _.get(sportEventAnalysis, 'benchmarkPlayer.previousPlayers.numbers.p1_v_p2won.p1', 0)
    const p1vp1wonp1Won = _.get(sportEventAnalysis, 'benchmarkPlayer.previousPlayers.numbers.p1_v_p1won.p1Won', 0)
    const p2vp1wonp2Won = _.get(sportEventAnalysis, 'benchmarkPlayer.previousPlayers.numbers.p2_v_p1won.p1Won', 0)
    const p2vp2wonp2Won = _.get(sportEventAnalysis, 'benchmarkPlayer.previousPlayers.numbers.p2_v_p2won.p2Won', 0)
    const p1vp2wonp1Won = _.get(sportEventAnalysis, 'benchmarkPlayer.previousPlayers.numbers.p1_v_p2won.p2Won', 0)

    var cal1 = (p2vp1wonp2 - p2vp1wonp2Won) - (p1vp1wonp1 - p1vp1wonp1Won)
    var cal2 = (p2vp2wonp2 - p2vp2wonp2Won) - (p1vp2wonp1 - p1vp2wonp1Won)

    if (wlP1 > wlP2) {
      cal1 = (p1vp1wonp1 - p1vp1wonp1Won) - (p2vp1wonp2 - p2vp1wonp2Won)
      cal2 = (p1vp2wonp1 - p1vp2wonp1Won) - (p2vp2wonp2 - p2vp2wonp2Won)
    }

    var gapCal1 = cal1 < 0 ? cal1 - gap : gap - cal1
    var gapCal2 = cal2 < 0 ? cal2 - gap : gap - cal2

    const result = gapCal1 > gapCal2 ? gapCal2 : gapCal1

    return result
  }
}