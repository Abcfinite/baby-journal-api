import { SportEvent } from "@abcfinite/tennislive-client/src/types/sportEvent"

export const toCsv = (jsonString: string) : string => {
  const csvHeader = [
    'id',
    'date',
    'time',
    'stage',
    'DO NOT BET',
    'just won fin',
    'just retired',
    'fav BM',
    'non fav BM',
    'BM gap',
    'fav p',
    'fav e',
    'fav form',
    'form stalled',
    'non fav p',
    'non fav e',
    'non fav form',
    'form gap',
    'non fav highest ranking',
    'fav current ranking',
    'ranking gap',
    'fav WL score',
    'non fav WL score',
    'WL score gap',
    'last won gap',
    'r',
    '1st set won',
    '3 set',
    'value',
    'green',
    'orange',
    'red'
  ].join(',')

  var resultArray = [csvHeader]

  var jsonArray = JSON.parse(jsonString)


  jsonArray.forEach(m => {
    var fav1 = m['player1']['currentRanking'] < m['player2']['currentRanking']
    resultArray.push([
      '',
      m['date'],
      m['time'],
      m['stage'],
      fav1? m['lostToLowerRankingThanOpponent']['player1']['number'] > 0 : m['lostToLowerRankingThanOpponent']['player2']['number'] > 0,
      '',
      '',
      fav1? m['analysis']['benchmarkPlayer']['bothPlayed']['player1Score'] : m['analysis']['benchmarkPlayer']['bothPlayed']['player2Score'],
      fav1? m['analysis']['benchmarkPlayer']['bothPlayed']['player2Score'] : m['analysis']['benchmarkPlayer']['bothPlayed']['player1Score'],
      '',
      fav1? m['player1']['name'] : m['player2']['name'],
      '',
      '',
      '',
      fav1? m['player2']['name'] : m['player1']['name'],
      '',
      '',
      '',
      fav1? m['player2']['highestRanking'] : m['player1']['highestRanking'],
      fav1? m['player1']['currentRanking'] : m['player2']['currentRanking'],
      '',
      fav1? m['analysis']['winLoseRanking']['player1'] : m['analysis']['winLoseRanking']['player2'],
      fav1? m['analysis']['winLoseRanking']['player2'] : m['analysis']['winLoseRanking']['player1'],
      '',
      m['analysis']['gap'],
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ].join(','))
  })

  return resultArray.join('\r\n')
}