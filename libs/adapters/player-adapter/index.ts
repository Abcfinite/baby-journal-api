import _, { forEach } from "lodash"
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
    const result = await this.matchesSummary(sportEvent, 1, 1.1)
    result.analysis = await new MatchAdapter().similarMatch(result)

    return result
  }

  async getResult(sportEvent: SportEvent) {

    const player1Id = sportEvent.player1.id

    const player1Matches = await new BetapiClient().getPlayerEndedMatches(player1Id, sportEvent.type)

    const match = player1Matches.events.find(m => m.id === sportEvent.id)

    if (match !== undefined && match !== null &&
      match.score !== undefined && match.score !== null &&
      match.player1won !== undefined && match.player1won !== null) {
      return {
        "id": match.id,
        "setScore": match.score,
        "winner": match.player1won ? '1' : '2'
      }
    }

    return null
  }


  async compareSportEvent(sportEvent: SportEvent) {

    const player1Id = sportEvent.player1.id
    const player2Id = sportEvent.player2.id

    // const currentH2h = await new BetapiClient().getEventSummary(sportEvent.id)
    const player1MatchesSum = await new BetapiClient().getPlayerEndedMatches(player1Id, sportEvent.type)
    const player2MatchesSum = await new BetapiClient().getPlayerEndedMatches(player2Id, sportEvent.type)

    var prematchOdds = null
    // if (sportEvent.bet365EventId) {
    //   prematchOdds = await new BetapiClient().getPrematchOddEventId(sportEvent.bet365EventId)
    // }

    const player1Matches = player1MatchesSum.events
    const player2Matches = player2MatchesSum.events

    const player1Name = player1Matches.find(p => p.player1.id === player1Id).player1.name
    const player2Name = player2Matches.find(p => p.player1.id === player2Id).player1.name

    const p1L10 = player1Matches.slice(0, 10).filter(p1m => p1m.player1.id === player1Id ? p1m.player1won : !p1m.player1won).length
    const p2L10 = player2Matches.slice(0, 10).filter(p2m => p2m.player1.id === player2Id ? p2m.player1won : !p2m.player1won).length

    const p1Streak = this.streakCheck(player1Matches, player1Id)
    const p2Streak = this.streakCheck(player2Matches, player2Id)

    const p1Consistency = this.playerConsistency(player1Matches, player1Id)
    const p2Consistency = this.playerConsistency(player2Matches, player2Id)

    const h2hAll = player1Matches.filter(p1m => p1m.player1.id === player2Id || p1m.player2.id === player2Id)

    let h2hP1Won = 0
    let h2hNo = 0
    let h2hP1WonLast

    if (h2hAll.length !== 0) {
      const h2h = h2hAll.splice(0, 10)

      h2hNo = h2h.length
      h2hP1Won = h2h.filter(h => (h.player1.id === player1Id && h.player1won) || (h.player2.id === player1Id && !h.player1won)).length

      h2hP1WonLast = h2h[0].player1.id === player1Id ? h2h[0].player1won : !h2h[0].player1won
    }

    var player1Last8 = player1Matches.slice(0, 8)
    var player2Last8 = player2Matches.slice(0, 8)

    player1Last8 = await Promise.all(
      player1Last8.map(async m => {
        const odd = await new BetapiClient().getEventPrematchOdd(m.id, sportEvent.type)
        const matchSummary = await new BetapiClient().getEventSummary(m.id, player1Id)

        m.odd = odd
        m.h2hP1 = matchSummary.h2hP1
        m.h2hP2 = matchSummary.h2hP2
        m.l10P1 = matchSummary.l10P1
        m.l10P2 = matchSummary.l10P2

        return m
      })
    )

    player2Last8 = await Promise.all(
      player2Last8.map(async m => {
        const odd = await new BetapiClient().getEventPrematchOdd(m.id, sportEvent.type)
        const matchSummary = await new BetapiClient().getEventSummary(m.id, player2Id)

        m.odd = odd
        m.h2hP1 = matchSummary.h2hP1
        m.h2hP2 = matchSummary.h2hP2
        m.l10P1 = matchSummary.l10P1
        m.l10P2 = matchSummary.l10P2

        return m
      })
    )

    // console.log('>>>>>>>BM')
    const player1matchesP1ids = player1Last8.map(p1l8 => p1l8.player1.id)
    const player1matchesP2ids = player1Last8.map(p1l8 => p1l8.player2.id)
    const player2matchesP1ids = player2Last8.map(p1l8 => p1l8.player1.id)
    const player2matchesP2ids = player2Last8.map(p1l8 => p1l8.player2.id)

    const uniquePlayerIds1 = player1matchesP1ids.concat(player1matchesP2ids).filter((e, i, self) => i === self.indexOf(e))
    const uniquePlayerIds2 = player2matchesP1ids.concat(player2matchesP2ids).filter((e, i, self) => i === self.indexOf(e))

    const bmPlayerIds = uniquePlayerIds1.filter(
      (element) => uniquePlayerIds2.includes(element))

    const bmPlayerIdsClean = bmPlayerIds.filter(arrayItem => arrayItem !== player1Id)
      .filter(arrayItem => arrayItem !== player2Id)


    // unique win-lost history
    let p1BM = []
    player1Last8.forEach(p1l8 => {
      const opponentId = p1l8.player1.id === player1Id ? p1l8.player2.id : p1l8.player1.id
      const playerWon = p1l8.player1.id === player1Id ? p1l8.player1won : !p1l8.player1won

      if (!playerWon && p1BM.find(p => p.opponentId === opponentId)) {
        p1BM = p1BM.filter(p => p.opponentId !== opponentId)
      }

      if (playerWon && bmPlayerIdsClean.includes(opponentId)) {
        p1BM.push(opponentId)
      }
    })

    let p2BM = []
    player2Last8.forEach(p2l8 => {
      const opponentId = p2l8.player1.id === player2Id ? p2l8.player2.id : p2l8.player1.id
      const playerWon = p2l8.player1.id === player2Id ? p2l8.player1won : !p2l8.player1won

      if (!playerWon && p2BM.find(p => p.opponentId === opponentId)) {
        p2BM = p2BM.filter(p => p.opponentId !== opponentId)
      }

      if (playerWon && bmPlayerIdsClean.includes(opponentId)) {
        p2BM.push(opponentId)
      }
    })

    const p1BMF = p1BM.filter((e, i, self) => i === self.indexOf(e)).length
    const p2BMF = p2BM.filter((e, i, self) => i === self.indexOf(e)).length
    const h2hP2 = h2hNo - h2hP1Won
    const h2hLastWinner = h2hP1WonLast ? 1 : 2

    const oddP1WinA = player1Last8.filter(p1l8 => p1l8.player1.id === player1Id && p1l8.player1won).map(p1l8 => p1l8.odd.prematchOddP1)
    const oddP1WinB = player1Last8.filter(p1l8 => p1l8.player1.id !== player1Id && !p1l8.player1won).map(p1l8 => p1l8.odd.prematchOddP2)
    const oddP1LostA = player1Last8.filter(p1l8 => p1l8.player1.id === player1Id && !p1l8.player1won).map(p1l8 => p1l8.odd.prematchOddP1)
    const oddP1LostB = player1Last8.filter(p1l8 => p1l8.player1.id !== player1Id && p1l8.player1won).map(p1l8 => p1l8.odd.prematchOddP2)
    const oddP1Winlowest = Math.max(...oddP1WinA, ...oddP1WinB)
    const oddP1LostHighest = Math.min(...oddP1LostA, ...oddP1LostB)

    const oddP2WinA = player2Last8.filter(p2l8 => p2l8.player1.id === player2Id && p2l8.player1won).map(p2l8 => p2l8.odd.prematchOddP1)
    const oddP2WinB = player2Last8.filter(p2l8 => p2l8.player1.id !== player2Id && !p2l8.player1won).map(p2l8 => p2l8.odd.prematchOddP2)
    const oddP2LostA = player2Last8.filter(p2l8 => p2l8.player1.id === player2Id && !p2l8.player1won).map(p2l8 => p2l8.odd.prematchOddP1)
    const oddP2LostB = player2Last8.filter(p2l8 => p2l8.player1.id !== player2Id && p2l8.player1won).map(p2l8 => p2l8.odd.prematchOddP2)
    const oddP2Winlowest = Math.max(...oddP2WinA, ...oddP2WinB)
    const oddP2LostHighest = Math.min(...oddP2LostA, ...oddP2LostB)

    const p1LastGameOdd = player1Last8[0].player1.id === player1Id ? player1Last8[0].odd.prematchOddP1 : player1Last8[0].odd.prematchOddP2
    const p2LastGameOdd = player2Last8[0].player1.id === player2Id ? player2Last8[0].odd.prematchOddP1 : player2Last8[0].odd.prematchOddP2

    // var p1LastGameEventSummary = await new BetapiClient().getEventSummary(player1Matches[0].id, player1Id)
    // var p2LastGameEventSummary = await new BetapiClient().getEventSummary(player2Matches[0].id, player2Id)

    // const p1PrevH2h = p1LastGameEventSummary.h2hP1
    // const p1PrevH2hV = p1LastGameEventSummary.h2hP2

    // const p2PrevH2h = p2LastGameEventSummary.h2hP1
    // const p2PrevH2hV = p2LastGameEventSummary.h2hP2

    const p1PrevH2h = player1Last8[0].h2hP1
    const p1PrevH2hV = player1Last8[0].h2hP2

    const p2PrevH2h = player2Last8[0].h2hP1
    const p2PrevH2hV = player2Last8[0].h2hP2

    const p1L10HistoryArray = player1Last8.map(p1m => `${p1m.l10P1} v ${p1m.l10P2} : ${p1m.player1.id === player1Id ? p1m.player1won : !p1m.player1won}`)
    const p1L10History = p1L10HistoryArray.filter(p1l => p1l !== undefined && p1l !== null).join(',')

    const p2L10HistoryArray = player2Last8.map(p2m => `${p2m.l10P1} v ${p2m.l10P2} : ${p2m.player1.id === player2Id ? p2m.player1won : !p2m.player1won}`)
    const p2L10History = p2L10HistoryArray.filter(p2l => p2l !== undefined && p2l !== null).join(',')

    const p1H2historyArray = player1Last8.map(p1m => `${p1m.h2hP1} v ${p1m.h2hP2} : ${p1m.player1.id === player1Id ? p1m.player1won : !p1m.player1won}`)
    const p1H2hHistory = p1H2historyArray.filter(p1l => p1l !== undefined && p1l !== null).join(',')

    const p1Match1 = this.matchHistoryObject(player1Last8[0], player1Id)
    const p1Match2 = this.matchHistoryObject(player1Last8[1], player1Id)
    const p1Match3 = this.matchHistoryObject(player1Last8[2], player1Id)
    const p1Match4 = this.matchHistoryObject(player1Last8[3], player1Id)
    const p1Match5 = this.matchHistoryObject(player1Last8[4], player1Id)

    const p2Match1 = this.matchHistoryObject(player2Last8[0], player2Id)
    const p2Match2 = this.matchHistoryObject(player2Last8[1], player2Id)
    const p2Match3 = this.matchHistoryObject(player2Last8[2], player2Id)
    const p2Match4 = this.matchHistoryObject(player2Last8[3], player2Id)
    const p2Match5 = this.matchHistoryObject(player2Last8[4], player2Id)

    const p2H2hHistoryArray = player2Last8.map(p2m => `${p2m.h2hP1} v ${p2m.h2hP2} : ${p2m.player1.id === player2Id ? p2m.player1won : !p2m.player1won}`)
    const p2H2hHistory = p2H2hHistoryArray.filter(p2l => p2l !== undefined && p2l !== null).join(',')

    const p1H2hTotalWins = this.p1H2hTotalWins(p1Match1, p1Match2, p1Match3, p1Match4, p1Match5)
    const p2H2hTotalWins = this.p2H2hTotalWins(p2Match1, p2Match2, p2Match3, p2Match4, p2Match5)
    const p1H2HWinRate = p1H2hTotalWins / (p1H2hTotalWins + p2H2hTotalWins)
    const netH2hWinDiff = p1H2hTotalWins - p2H2hTotalWins

    const intercept = 0.5563;
    const coefficients = {
      p1_h2h_total_wins: -0.0104,
      p2_h2h_total_wins: -0.0066,
      p1_h2h_win_rate: 0.2988,
      net_h2h_diff: -0.0038,
      h2h_p1: 0.1634,
      h2h_p2: -0.2976,
    };

    const z =
      intercept +
      coefficients.p1_h2h_total_wins * p1H2hTotalWins +
      coefficients.p2_h2h_total_wins * p2H2hTotalWins +
      coefficients.p1_h2h_win_rate * p1H2HWinRate +
      coefficients.net_h2h_diff * netH2hWinDiff +
      coefficients.h2h_p1 * h2hP1Won +
      coefficients.h2h_p2 * h2hP2

    const p1WinProbF1 = 1 / (1 + Math.exp(-z))

    const scores = {
      p1H2hTotalWins,
      p2H2hTotalWins,
      p1H2HWinRate,
      netH2hWinDiff,
      p1WinProbF1
    }

    const result = {
      "id": sportEvent.id,
      "date": sportEvent.date,
      "time": sportEvent.time,
      "p1Id": player1Id,
      "p2Id": player2Id,
      "p1Name": player1Name,
      "p2Name": player2Name,
      "p1Odd": 0,
      "p2Odd": 0,
      "h2hP1": h2hP1Won,
      h2hP2,
      h2hLastWinner,
      "bmP1": p1BMF,
      "bmP2": p2BMF,
      "h2hBm": `${h2hP1Won}#${h2hP2}#${p1BMF}#${p2BMF}`,
      "h2hBmLastWinner": `${h2hP1Won}#${h2hP2}#${h2hLastWinner}#${p1BMF}#${p2BMF}`,
      p1L10,
      p2L10,
      p1Consistency,
      p2Consistency,
      p1Streak,
      p2Streak,
      player1Last8,
      player2Last8,
      oddP1Winlowest,
      oddP1LostHighest,
      oddP2Winlowest,
      oddP2LostHighest,
      p1LastGameOdd,
      p2LastGameOdd,
      p1PrevH2h,
      p1PrevH2hV,
      p2PrevH2h,
      p2PrevH2hV,
      p1L10History,
      p2L10History,
      p1H2hHistory,
      p2H2hHistory,
      prematchOdds,
      p1Match1,
      p1Match2,
      p1Match3,
      p1Match4,
      p1Match5,
      p2Match1,
      p2Match2,
      p2Match3,
      p2Match4,
      p2Match5,
      scores,
      'p1MatchNo': player1MatchesSum.matchNo,
      'p2MatchNo': player2MatchesSum.matchNo,
      "setScore": 'waiting',
      "winner": 'waiting'
    }

    if (sportEvent.type !== '92') return result

    const p1LastGameWon = player1Matches[0].player1.id === player1Id ? player1Matches[0].player1won : !player1Matches[0].player1won
    const p2LastGameWon = player2Matches[0].player1.id === player2Id ? player2Matches[0].player1won : !player2Matches[0].player1won
    const p1LastGameSetScore = player1Matches[0].score
    const p2LastGameSetScore = player2Matches[0].score
    const p1LastGameOpponentName = player1Matches[0].player1.id === player1Id ? player1Matches[0].player2.name : player1Matches[0].player1.name
    const p2LastGameOpponentName = player2Matches[0].player1.id === player2Id ? player2Matches[0].player2.name : player2Matches[0].player1.name

    const tableTennisResult = {
      ...result,
      p1LastGameWon,
      p2LastGameWon,
      p1LastGameSetScore,
      p2LastGameSetScore,
      p1LastGameOpponentName,
      p2LastGameOpponentName
    }

    return tableTennisResult
  }

  p1H2hTotalWins(p1Match1: any, p1Match2: any, p1Match3: any, p1Match4: any, p1Match5: any) {
    let p1H2hTotalWins = 0
    p1H2hTotalWins = p1H2hTotalWins + p1Match1.h2hP1
    p1H2hTotalWins = p1H2hTotalWins + p1Match2.h2hP1
    p1H2hTotalWins = p1H2hTotalWins + p1Match3.h2hP1
    p1H2hTotalWins = p1H2hTotalWins + p1Match4.h2hP1
    p1H2hTotalWins = p1H2hTotalWins + p1Match5.h2hP1
    return p1H2hTotalWins

  }

  p2H2hTotalWins(p2Match1: any, p2Match2: any, p2Match3: any, p2Match4: any, p2Match5: any) {
    let p2H2hTotalWins = 0
    p2H2hTotalWins = p2H2hTotalWins + p2Match1.h2hP1
    p2H2hTotalWins = p2H2hTotalWins + p2Match2.h2hP1
    p2H2hTotalWins = p2H2hTotalWins + p2Match3.h2hP1
    p2H2hTotalWins = p2H2hTotalWins + p2Match4.h2hP1
    p2H2hTotalWins = p2H2hTotalWins + p2Match5.h2hP1
    return p2H2hTotalWins

  }

  matchHistoryObject(player1Matches: any, playerId: string) {
    return {
      p1: player1Matches.h2hP1,
      p2: player1Matches.h2hP2,
      p1Won: player1Matches.player1.id === playerId ? player1Matches.player1won : !player1Matches.player1won
    }
  }

  playerConsistency(player1Matches: any, player1Id: string) {
    let wonWon = 0
    let wonLost = 0
    let lostWon = 0
    let lostLost = 0


    let outIndex = 1
    const reversedPlayer1MatchesL10 = player1Matches.slice(0, 10).reverse()
    reversedPlayer1MatchesL10.forEach(p1m => {

      const opponentId = p1m.player1.id === player1Id ? p1m.player2.id : p1m.player1.id
      const playerWon = p1m.player1.id === player1Id ? p1m.player1won : !p1m.player1won

      reversedPlayer1MatchesL10.slice(outIndex, 10).forEach(p1m2 => {

        if (p1m2.player1.id === opponentId || p1m2.player2.id === opponentId) {
          const playerWonNext = p1m2.player1.id === player1Id ? p1m2.player1won : !p1m2.player1won

          if (playerWon && playerWonNext) {
            wonWon++
          } else if (playerWon && !playerWonNext) {
            wonLost++
          } else if (!playerWon && playerWonNext) {
            lostWon++
          } else if (!playerWon && !playerWonNext) {
            lostLost++
          }
        }
      })
      outIndex++
    })

    return {
      wonWon,
      wonLost,
      lostWon,
      lostLost
    }
  }

  streakCheck(matches: any, playerId: string) {
    const lastResult = matches[0].player1won && matches[0].player1.id === playerId ||
      !matches[0].player1won && matches[0].player2.id === playerId
    let index = 1
    for (var i = 1; i < matches.length; i++) {
      const matchResult = matches[i].player1won && matches[i].player1.id === playerId ||
        !matches[i].player1won && matches[i].player2.id === playerId

      if (matchResult !== lastResult) {
        break
      }
      index++
    }

    return `${index}${lastResult ? 'W' : 'L'} `
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
