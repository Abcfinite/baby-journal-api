import { Match } from "./match"

export type Player = {
  id: string,
  name: string,
  country: string,
  dob: string,
  currentRanking: number,
  highestRanking: number,
  matchesTotal: number,
  matchesWon: number,
  url: string | null,
  type: string,
  prizeMoney: number,
  previousMatches: HTMLElement | null,
  incomingMatchUrl: string | null,
  parsedPreviousMatches: Array<Match> | null,
  h2h: number
}