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
    'result',
    'date',
    'time',

    'p1 name',
    'p2 name',
    'h2hBmLastWinner',
    'p1prediction',
    'p2prediction',

    'hasCleanSheet',
    'h2h gap',
    'BM gap',
    'predMatchNo',

  ].join(',')

  const resultArray = [csvHeader]

  items.forEach(m => {
    resultArray.push([
      '',
      '',
      '',
      m['date'],
      m['time'],

      m['p1Name'],
      m['p2Name'],
      m['h2hBmLastWinner'],
      m['p1prediction'],
      m['p2prediction'],

      m['hasCleanSheet'],
      Number(m['h2hBmLastWinner'].split('#')[0]) - Number(m['h2hBmLastWinner'].split('#')[1]),
      Number(m['h2hBmLastWinner'].split('#')[3]) - Number(m['h2hBmLastWinner'].split('#')[4]),
      m['predMatchNo'],
    ].join(','))
  })

  return resultArray.join('\r\n')
}