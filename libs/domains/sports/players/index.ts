import BetapiClient from '@abcfinite/betapi-client'
import { Handler } from 'aws-lambda';

export const getPlayer: Handler = async (event: any) => {
  const { player1Id, player2Id } = event.queryStringParameters

  const player1MatchesSum = await new BetapiClient().getPlayerEndedMatches(player1Id, '92')
  const player2MatchesSum = await new BetapiClient().getPlayerEndedMatches(player2Id, '92')

  const player1Matches = player1MatchesSum.events
  const player2Matches = player2MatchesSum.events

  const responseText = `player 1 matches: ${player1Matches.length}, player 2 matches: ${player2Matches.length}`

  const h2h = player1Matches.filter(p1m => p1m.player1.id === player2Id || p1m.player2.id === player2Id).splice(0, 8)

  console.log('p1 name : ', player1Matches.find(p => p.player1.id === player1Id).player1.name)
  console.log('p2 name : ', player2Matches.find(p => p.player1.id === player2Id).player1.name)

  console.log('>>>h2h matches : ', h2h.length)
  console.log('p1 won : ', h2h.filter(h => (h.player1.id === player1Id && h.player1won) || (h.player2.id === player1Id && !h.player1won)).length)

  console.log('>>>>>last h2h P1 won : ', h2h[0].player1.id === player1Id ? h2h[0].player1won : !h2h[0].player1won)

  const player1Last8 = player1Matches.slice(0, 8)
  const player2Last8 = player2Matches.slice(0, 8)

  console.log('>>>>>>>BM')
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

  console.log(bmPlayerIdsClean)


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

  console.log('>>>>>P1 BM : ', p1BM.filter((e, i, self) => i === self.indexOf(e)).length)
  console.log('>>>>>P2 BM : ', p2BM.filter((e, i, self) => i === self.indexOf(e)).length)

  const response = {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: responseText,
      },
      null,
      2
    ),
  };

  return new Promise((resolve) => {
    resolve(response)
  })
}

