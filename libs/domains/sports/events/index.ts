import PlayerAdapter from '@abcfinite/player-adapter'
import ScheduleAdapter from '@abcfinite/schedule-adapter'
import { Handler } from 'aws-lambda';

export const checkPlayer: Handler = async (event: any) => {
  const { player1, player2, player1Odd, player2Odd } = event.queryStringParameters
  var response

  if (player1 === null || player1 === '' ||
    player2 === null || player2 === '' ||
    player1Odd === null || player1Odd === '' ||
    player2Odd === null || player2Odd === '') {
    response = {
      statusCode: 400,
      body: 'missing parameters'
    }
  } else {
    var result

    try {
      result = await new PlayerAdapter().checkPlayer(
        player1, player2,
        parseFloat(player1Odd), parseFloat(player2Odd))

      response = {
        statusCode: 200,
        body: JSON.stringify(result,
          null,
          2
        ),
      }
    } catch (ex) {
      console.error('>>>>error>>', player1, '>>>', player2)
      console.error(ex)
      response = {
        statusCode: 400,
        body: 'one of player not found',
      }
    }
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getPredictions: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getPredictions()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getPredictionsTT: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getPredictionsTT()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getCurrentPredictionsTT: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getCurrentPredictionsTT()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}



export const getSchedule: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getSchedule()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getScheduleTT: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getScheduleTT()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getResults: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getResults()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getPlayersName: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getPlayersName()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getPlayersUrl: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getPlayersUrl()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const cacheBetAPI: Handler = async (event: any) => {
  let tennisBetAPIResult = await new ScheduleAdapter().cacheTennisBetAPI()
  let tableTennisBetAPIResult = await new ScheduleAdapter().cacheTableTennisBetAPI()
  let cacheEsportsBetAPIResult = await new ScheduleAdapter().cacheEsportsBetAPI()

  const responseText = `tennis events : ${tennisBetAPIResult}
    table tennis events : ${tableTennisBetAPIResult}
    esports events : ${cacheEsportsBetAPIResult}`

  // const responseText = `table tennis events: ${tableTennisBetAPIResult}`


  const response = {
    statusCode: 200,
    body: JSON.stringify(responseText,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const removeAllCache: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().removeAllCache()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getTableTennisCheck: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getTableTennisSchedule()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getTableTennisNext: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getTableTennisNext()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getScheduleEsports: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getScheduleEsports()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getScheduleTennis: Handler = async (event: any) => {
  var result = await new ScheduleAdapter().getScheduleTennis()

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}

export const getPendingResults: Handler = async (event: any) => {

  const { sport } = event.queryStringParameters

  var result = await new ScheduleAdapter().getPendingResults(sport)

  var response = {
    statusCode: 200,
    body: JSON.stringify(result,
      null,
      2
    ),
  }

  return new Promise((resolve) => {
    resolve(response)
  })
}


