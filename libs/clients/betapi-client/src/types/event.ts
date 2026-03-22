import { Odds } from "./odds"
import { Player } from "./player"

export interface Event {
  id: string,
  secondaryId?: string,
  time: string,
  isYesterday?: boolean,
  player1: Player,
  player2: Player,
  odds?: Odds,
  stage: string,
  score?: string,
  player1won?: boolean,
  retired?: number,
  h2hP1: any,
  h2hP2: any,
  l10P1: any,
  l10P2: any
}

// retired
// 0 - no retired
// 1 - player1
// 2 - player2

// round
// 14 - q1
// 19 - qual
// 44 - qual
// 24 - 1st round
// 25 - 1st round
// 26 - 2nd round
// 27 - quarterfinal
// 28 - semifinal
// 29 - final
// 45 - q1
// 54 - q1
// 62 - q2
