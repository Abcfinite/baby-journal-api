import { Odds } from "./odds"
import { Player } from "./player"

export interface Event {
  id: string,
  secondaryId?: string,
  time: string,
  player1: Player,
  player2: Player,
  odds?: Odds,
  stage: string,
  score?: string,
  player1won?: boolean,
  retired?: number
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
