import { Player } from "./player"

export interface SportEvent {
  id: string,
  date: string,
  time: string,
  stage: string,
  url: string,
  type: string,
  competitionName: string,
  player1Odd?: number,
  player2Odd?: number,
  player1: Player,
  player2: Player,
}

export const playerNamesToSportEvent = (player1Id: string, player1Url: string,
  player1Name: string, player2Id: string, player2Url: string, player2Name: string): SportEvent => {
  return {
    id: '',
    date: '',
    time: '',
    stage: '',
    type: '',
    url: '',
    competitionName: '',
    player1: {
      id: player1Id,
      name: player1Name,
      country: '',
      dob: '',
      currentRanking: 0,
      highestRanking: 0,
      matchesTotal: 0,
      matchesWon: 0,
      url: player1Url,
      type: '',
      prizeMoney: 0,
      previousMatches: null,
      parsedPreviousMatches: null,
      incomingMatchUrl: '',
      h2h: 0,
    },
    player2: {
      id: player2Id,
      name: player2Name,
      country: '',
      dob: '',
      currentRanking: 0,
      highestRanking: 0,
      matchesTotal: 0,
      matchesWon: 0,
      url: player2Url,
      type: '',
      prizeMoney: 0,
      previousMatches: null,
      parsedPreviousMatches: null,
      incomingMatchUrl: '',
      h2h: 0
    }
  }
}