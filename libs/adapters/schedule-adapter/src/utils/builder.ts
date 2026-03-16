import _ from "lodash"

export const toCsv = (jsonString: string): string => {
  const csvHeader = [
    'id',
    'date',
    'time',
    'stage',
    'highest ranking won current comp gap',
    'f h2h',
    'nf h2h',
    'f lostToLowerRankingThanOpponent',

    'f winFromHigherRankingThanOpponent',
    'nf lostToLowerRankingThanOpponent',
    'nf winFromHigherRankingThanOpponent',
    'f winFromHigherRanking',
    'nf winFromHigherRanking',
    'f lostFromHigherRanking',
    'nf lostFromHigherRanking',
    'f higher win%',
    'f match-no lower',

    'nf has less than half match no f',
    'f 3set% bigger',
    'f 3set win%',
    'nf 3set win%',
    'fav BM',

    'non fav BM',
    'BM gap',
    'f age',
    'nf age',
    'age gap',
    'fav p',
    'just retired',
    'just won fin',
    'f just Lost From Lower Ranking',
    'highest stage last 3 comp',
    'f match total',

    'f win%',
    'highest win ranking current comp',
    'fav form',
    'non fav p',
    'nf just Lost From Lower Ranking',
    'highest stage last 3 comp',
    'nf match total',

    'nf win%',
    'highest win ranking current comp',
    'non fav form',
    'form gap',
    'f prize',
    'nf prize',
    'prize gap',
    'f c ranking',
    'f win highest',
    'f lost lowest',
    'nf c ranking',

    'nf h ranking',
    'nf win highest',
    'nf lost lowest',
    'f lost lowest below nf c ranking',
    'nf win highest on top of f c ranking',
    'ranking gap',
    'fav WL score',
    'non fav WL score',
    'WL score gap',

    'r',
  ].join(',')

  const resultArray = [csvHeader]

  const jsonArray = JSON.parse(jsonString)

  jsonArray.forEach(m => {
    const fav1 = m['player1']['currentRanking'] < m['player2']['currentRanking']

    resultArray.push([
      '',
      m['date'],
      m['time'],
      m['stage'],
      '',
      fav1 ? _.get(m, "['player1']['h2h']", 'not found') : _.get(m, "['player2']['h2h']", 'not found'),
      fav1 ? _.get(m, "['player2']['h2h']", 'not found') : _.get(m, "['player1']['h2h']", 'not found'),
      fav1 ? _.get(m, "['lostToLowerRankingThanOpponent']['player1']['number']", 'not found') :
        _.get(m, "['lostToLowerRankingThanOpponent']['player2']['number']", 'not found'),

      fav1 ? _.get(m, "['winFromHigherRankingThanOpponent']['player1']['number']", 'not found') :
        _.get(m, "['winFromHigherRankingThanOpponent']['player2']['number']", 'not found'),
      fav1 ? _.get(m, "['lostToLowerRankingThanOpponent']['player2']['number']", 'not found') :
        _.get(m, "['lostToLowerRankingThanOpponent']['player1']['number']", 'not found'),
      fav1 ? _.get(m, "['winFromHigherRankingThanOpponent']['player2']['number']", 'not found') :
        _.get(m, "['winFromHigherRankingThanOpponent']['player1']['number']", 'not found'),
      fav1 ? _.get(m, "['winfromHigherRanking']['player1']['number']", 'not found') :
        _.get(m, "['winfromHigherRanking']['player2']['number']", 'not found'),
      fav1 ? _.get(m, "['winfromHigherRanking']['player2']['number']", 'not found') :
        _.get(m, "['winfromHigherRanking']['player1']['number']", 'not found'),
      fav1 ? _.get(m, "['lostToLowerRanking']['player1']['number']", 'not found') :
        _.get(m, "['lostToLowerRanking']['player2']['number']", 'not found'),
      fav1 ? _.get(m, "['lostToLowerRanking']['player2']['number']", 'not found') :
        _.get(m, "['lostToLowerRanking']['player1']['number']", 'not found'),
      '',
      '', // f match-no lower

      '', // nf has less than half match no f
      '',
      fav1 ? _.get(m, "['analysis']['win3setRate']['player1']", 'not found') :
        _.get(m, "['analysis']['win3setRate']['player2']", 'not found')
      ,
      fav1 ? _.get(m, "['analysis']['win3setRate']['player2']", 'not found') :
        _.get(m, "['analysis']['win3setRate']['player1']", 'not found'),
      fav1 ? _.get(m, "['analysis']['benchmarkPlayer']['bothPlayed']['player1Score']", 'not found') :
        _.get(m, "['analysis']['benchmarkPlayer']['bothPlayed']['player2Score']", 'not found'),

      fav1 ? _.get(m, "['analysis']['benchmarkPlayer']['bothPlayed']['player2Score']", 'not found') :
        _.get(m, "['analysis']['benchmarkPlayer']['bothPlayed']['player1Score']", 'not found'),
      '',  // BM gap
      fav1 ? _.get(m, "['analysis']['age']['player1']", 'not found') : _.get(m, "['analysis']['age']['player2']", 'not found'),
      fav1 ? _.get(m, "['analysis']['age']['player2']", 'not found') : _.get(m, "['analysis']['age']['player1']", 'not found'),
      '', // age gap
      fav1 ? _.get(m, "['player1']['name']", 'not found') : _.get(m, "['player2']['name']", 'not found'),
      '',
      '', // just won fin
      fav1 ? _.get(m, "['analysis']['redFlag']['justLostFromLowerRanking']['player1']", 'not found') :
        _.get(m, "['analysis']['redFlag']['justLostFromLowerRanking']['player2']", 'not found'), // f just Lost From Lower Ranking
      '',
      fav1 ? _.get(m, "['winPercentage']['player1']['matchTotal']", 'not found') :
        _.get(m, "['winPercentage']['player2']['matchTotal']", 'not found'),

      fav1 ? _.get(m, "['winPercentage']['player1']['winPercentage']", 'not found') :
        _.get(m, "['winPercentage']['player2']['winPercentage']", 'not found'), // f win%
      fav1 ? _.get(m, "['analysis']['wonHighestRankingOnCurrentCompetition']['player1']", 'not found') :
        _.get(m, "['analysis']['wonHighestRankingOnCurrentCompetition']['player2']", 'not found'), // highest win ranking current comp
      '',
      fav1 ? _.get(m, "['player2']['name']", 'not found') : _.get(m, "['player1']['name']", 'not found'),
      fav1 ? _.get(m, "['analysis']['redFlag']['justLostFromLowerRanking']['player2']", 'not found') :
        _.get(m, "['analysis']['redFlag']['justLostFromLowerRanking']['player1']", 'not found'), // nf just Lost From Lower Ranking
      '', // highest stage last 3 comp
      fav1 ? _.get(m, "['winPercentage']['player2']['matchTotal']", 'not found') :
        _.get(m, "['winPercentage']['player1']['matchTotal']", 'not found'), // nf match total

      fav1 ? _.get(m, "['winPercentage']['player2']['winPercentage']", 'not found') :
        _.get(m, "['winPercentage']['player1']['winPercentage']", 'not found'), // nf win%
      fav1 ? _.get(m, "['analysis']['wonHighestRankingOnCurrentCompetition']['player2']", 'not found') :
        _.get(m, "['analysis']['wonHighestRankingOnCurrentCompetition']['player1']", 'not found'), // highest win ranking current comp

      '',
      '', // form gap
      fav1 ? _.get(m, "['player1']['prizeMoney']", 0) :
        _.get(m, "['player2']['prizeMoney']", 0),
      fav1 ? _.get(m, "['player2']['prizeMoney']", 0) :
        _.get(m, "['player1']['prizeMoney']", 0),
      '', // prize gap
      fav1 ? _.get(m, "['player1']['currentRanking']", 'not found') :
        _.get(m, "['player2']['currentRanking']", 'not found'), // f c ranking
      fav1 ? _.get(m, "['analysis']['highLowRanking']['player1']['winHighest']", 'not found') :
        _.get(m, "['analysis']['highLowRanking']['player2']['winHighest']", 'not found'),
      fav1 ? _.get(m, "['analysis']['highLowRanking']['player1']['lostLowest']", 'not found') :
        _.get(m, "['analysis']['highLowRanking']['player2']['lostLowest']", 'not found'),
      fav1 ? _.get(m, "['player2']['currentRanking']", 'not found') :
        _.get(m, "['player1']['currentRanking']", 'not found'), // nf c ranking

      fav1 ? _.get(m, "['player2']['highestRanking']", 'not found') :
        _.get(m, "['player1']['highestRanking']", 'not found'),
      fav1 ? _.get(m, "['analysis']['highLowRanking']['player2']['winHighest']", 'not found') :
        _.get(m, "['analysis']['highLowRanking']['player1']['winHighest']", 'not found'),
      fav1 ? _.get(m, "['analysis']['highLowRanking']['player2']['lostLowest']", 'not found') :
        _.get(m, "['analysis']['highLowRanking']['player1']['lostLowest']", 'not found'),
      '',
      '',
      '',
      fav1 ? _.get(m, "['analysis']['winLoseRanking']['player1']", 'not found') :
        _.get(m, "['analysis']['winLoseRanking']['player2']", 'not found'),
      fav1 ? _.get(m, "['analysis']['winLoseRanking']['player2']", 'not found') :
        _.get(m, "['analysis']['winLoseRanking']['player1']", 'not found'),
      '',

      '',
    ].join(','))
  })

  return resultArray.join('\r\n')
}

export const toTTCsv = (jsonString: string): string => {
  const csvHeader = [
    'odd',
    'bet on',
    'result',
    'date',
    'time',

    'p1 name',
    'p2 name',
    'p1 h2h',
    'p2 h2h',
    'p1 L10',
    'p2 L10',
    'p1 L30',
    'p2 L30',

    'h2h last winner',
    'p1 BM',
    'p2 BM',
  ].join(',')

  const resultArray = [csvHeader]

  const jsonArray = JSON.parse(jsonString)

  jsonArray.forEach(m => {
    resultArray.push([
      '',
      '',
      '',
      m['date'],
      m['time'],

      m['p1Name'],
      m['p2Name'],
      m['h2hP1'],
      m['h2hP2'],
      m['p1L10'],
      m['p2L10'],
      m['p1L30'],
      m['p2L30'],

      m['h2hLastWinner'],
      m['bmP1'],
      m['bmP2'],
    ].join(','))
  })

  return resultArray.join('\r\n')
}

export const toTTPredCsv = (items: any): string => {
  const csvHeader = [
    'odd',
    'bet on',
    'winner',
    'notes',

    'time',
    'p1 name',
    'p2 name',

    'p1 last game won',
    'p2 last game won',
    'p1 last game set score',
    'p2 last game set score',
    'p1 last game opponent name',
    'p2 last game opponent name',

    'p1 match no',
    'p2 match no',

    'h2h gap',
    'BM gap',
    'L10 gap',

    'won won gap',
    'won lost gap',
    'lost won gap',
    'lost lost gap',

    'h2h P1',
    'h2h P2',
    'BM P1',
    'BM P2',
    'L10 P1',
    'L10 P2',

    'p1 won won',
    'p1 won lost',
    'p1 lost won',
    'p1 lost lost',

    'p2 won won',
    'p2 won lost',
    'p2 lost won',
    'p2 lost lost',

    'P1 win prediction',
    'prediction match no',
    'P1 win prediction 2',
    'prediction 2 match no',
    'P1 win prediction 2 Rev',
    'prediction 2 Rev match no',

  ].join(',')

  const resultArray = [csvHeader]

  items.forEach(m => {
    resultArray.push([
      '',
      '',
      '',
      '',

      m['time'].split(',')[1],
      m['p1Name'],
      m['p2Name'],

      m['p1LastGameWon'],
      m['p2LastGameWon'],
      m['p1LastGameSetScore'],
      m['p2LastGameSetScore'],
      m['p1LastGameOpponentName'],
      m['p2LastGameOpponentName'],

      m['p1MatchNo'],
      m['p2MatchNo'],

      Number(m['h2hP1']) - Number(m['h2hP2']),
      Number(m['bmP1']) - Number(m['bmP2']),
      Number(m['l10P1']) - Number(m['l10P2']),

      Number(m['p1WonWon']) - Number(m['p2WonWon']),
      Number(m['p2WonLost']) - Number(m['p1WonLost']),
      Number(m['p1LostWon']) - Number(m['p2LostWon']),
      Number(m['p2LostLost']) - Number(m['p1LostLost']),

      m['h2hP1'],
      m['h2hP2'],
      m['bmP1'],
      m['bmP2'],
      m['l10P1'],
      m['l10P2'],

      m['p1WonWon'],
      m['p1WonLost'],
      m['p1LostWon'],
      m['p1LostLost'],

      m['p2WonWon'],
      m['p2WonLost'],
      m['p2LostWon'],
      m['p2LostLost'],

      m['predictionP1Win'],
      m['predictionMatchNo'],
      m['prediction2P1Win'],
      m['prediction2MatchNo'],
      m['prediction2RevP1Win'],
      m['prediction2RevMatchNo'],

    ].join(','))
  })

  return resultArray.join('\r\n')
}
