import _ from "lodash"
import { parse } from 'csv-parse'
import { Readable } from 'stream'

import { Client } from 'pg'
import { toQuery, formatResult, prediction, probability } from './src/utils/helper'
import { getPendingMatchRecords, getSimilarMatch, insertMatchRecords, updateMatchRecordPrediction, updateMatchRecordWinner } from './src/utils/database'

import S3ClientCustom from '@abcfinite/s3-client-custom'
import { putItem, executeScan, executeQuery, executeQueryIndex, updateItem, removeItem } from '@abcfinite/dynamodb-client'
import { playerNamesToSportEvent, SportEvent } from "@abcfinite/tennislive-client/src/types/sportEvent"
import PlayerAdapter from '@abcfinite/player-adapter'
import {
  SQSClient, SendMessageCommand,
  ReceiveMessageCommand, GetQueueAttributesCommand,
  DeleteMessageCommand,
  PurgeQueueCommand
} from "@aws-sdk/client-sqs";
import { toCsv, toTTCsv, toTTPredCsv } from "./src/utils/builder"
import BetapiClient from "@abcfinite/betapi-client"
import TennisliveClient from "@abcfinite/tennislive-client"
import { put } from "@abcfinite/dynamodb-client/src/items"

export default class ScheduleAdapter {

  currentCheckDate = '08/02/2025'
  matchNoTennis = 118
  matchNoEsports = 35

  async removeAllCache() {
    const s3ClientCustom = new S3ClientCustom()
    await s3ClientCustom.deleteAllFiles('betapi-cache')
    await s3ClientCustom.deleteAllFiles('tennis-match-schedule')
    await s3ClientCustom.deleteAllFiles('table-tennis-match-schedule')
    await s3ClientCustom.deleteAllFiles('esports-match-schedule')

    const queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/146261234111/tennis-match-schedule-queue'
    const client = new SQSClient({ region: 'ap-southeast-2' });


    const params = {
      QueueUrl: queueUrl, // URL of the queue to be purged
    };

    try {
      const purgeCommand = new PurgeQueueCommand(params);
      await client.send(purgeCommand);
      console.log(`Queue purged: ${queueUrl}`);
    } catch (err) {
      console.error("Error purging queue:", err);
    }

    return 'all cache removed and sqs queue purged'
  }

  async cacheTennisBetAPI() {
    // get latest schedule
    // todo : why need to get result first ??? Is it to warm up the lambda ???
    const s3ClientCustom = new S3ClientCustom()
    await s3ClientCustom.getFile('tennis-match-schedule', 'result.json')

    const events = await new BetapiClient().getEvents('13')

    // // safe all main players in dynamodb
    // if (events.length === 0) { return 'no match scheduled' }

    // // filter out double
    // const filteredEvents = events.map(event => {
    //   if (!event.player1.name.includes('/')) {
    //     return event
    //   }
    // }).filter(Boolean)

    // // collect putItem function
    // const player1s =
    //   filteredEvents.map(event => {
    //     const player1 = {
    //       "id": event.player1.id,
    //       "full_name": event.player1.name,
    //       "url_found": true,
    //     }

    //     if (player1.full_name === undefined || player1.full_name === null) {
    //       console.error('>>>>>player2.full_name is null')
    //       console.error(player1)
    //       return
    //     }

    //     return putItem('tennis_players', player1)
    //   })


    // const player2s =
    //   filteredEvents.map(event => {
    //     const player2 = {
    //       "id": event.player2.id,
    //       "full_name": event.player2.name,
    //       "url_found": true,
    //     }

    //     if (player2.full_name === undefined || player2.full_name === null) {
    //       console.error('>>>>>player2.full_name is null')
    //       console.error(player2)
    //       return
    //     }

    //     return putItem('tennis_players', player2)
    //   })

    // // execute putItem on dynamodb
    // await Promise.all(player1s)
    // await Promise.all(player2s)

    // // return number of matches
    return events.length
  }

  async cacheTableTennisBetAPI() {
    const events = await new BetapiClient().getEvents('92')

    return events.length
  }

  async cacheEsportsBetAPI() {
    const events = await new BetapiClient().getEvents('151')

    return events.length
  }

  async getPredictions() {
    var data = []
    const todayCsv = await new S3ClientCustom().getFile('tennis-match-schedule', 'today.csv')
    const processFile = async () => {
      const records = []
      const parser = Readable.from(todayCsv)
        .pipe(parse())
      for await (const record of parser) {
        records.push(record)
      }
      return records
    }

    await (async () => {
      const records = await processFile();

      for (var i = 1; i < records.length; i++) {
        data.push({
          fp: records[i][36],
          highest_ranking_won_current_comp_gap: Number(records[i][10]),
          nf_highest_win_v_f_ranking: Number(records[i][11]),
          f_highest_win_vs_nf_ranking: Number(records[i][12]),
          prize_gap: Number(records[i][56]),
          fp_win_highest_v_nf_win_highest: Number(records[i][64]),
          f_lost_lowest_v_nf_current_ranking: Number(records[i][65]),
          nf_highest_won_v_f_current_ranking: Number(records[i][66]),
          nf_highest_won_v_f_lowest_lost_ranking: Number(records[i][67]),
        })
      }
    })()

    console.log('>>>>query-1')
    const connection = new Client({
      connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
      ssl: {
        rejectUnauthorized: false
      }
    });

    await connection.connect();

    await Promise.all(
      data.map(async d => {
        var matchResultQuery = `SELECT match_result
          FROM matches 
          WHERE highest_ranking_won_current_comp_gap ${toQuery(d.highest_ranking_won_current_comp_gap)}
            AND nf_highest_win_v_f_ranking ${toQuery(d.nf_highest_win_v_f_ranking)}
            AND f_highest_win_vs_nf_ranking ${toQuery(d.f_highest_win_vs_nf_ranking)}
            AND prize_gap ${toQuery(d.prize_gap)}
            AND fp_win_highest_v_nf_win_highest ${toQuery(d.fp_win_highest_v_nf_win_highest)}
            AND f_lost_lowest_v_nf_current_ranking ${toQuery(d.f_lost_lowest_v_nf_current_ranking)}
            AND nf_highest_won_v_f_current_ranking ${toQuery(d.nf_highest_won_v_f_current_ranking)}
            AND nf_highest_won_v_f_lowest_lost ${toQuery(d.nf_highest_won_v_f_lowest_lost_ranking)}`

        const queryResult = await connection.query(matchResultQuery)

        if (queryResult.rowCount === 0) {
          d['result'] = 'no-data'
        } else if (queryResult.rowCount === 1) {
          d['result'] = 'query-1 (only1)'
        } else {
          d['result'] = formatResult(queryResult)
        }

        d['prediction'] = prediction(queryResult)
        d['probability'] = probability(queryResult)
      })
    )

    await connection.end();

    // return csv file
    return data.map(p => [p.fp, p.result, p.prediction, p.probability]).join('\r\n')
  }

  async getPredictionsTT(sport: string) {
    var tableName = 'table_tennis_matches'
    if (sport === 'tennis') {
      tableName = 'tennis_matches'
    }

    const pendingMatchesResult = await getPendingMatchRecords(tableName)

    for (const match of pendingMatchesResult) {
      const similarMatches = await getSimilarMatch(match, tableName)

      const prediction = {
        id: match.id,
        p1Probability: similarMatches.length > 0 ? (similarMatches.filter(m => m.winner === '1').length / similarMatches.length).toFixed(2) : '0',
        probabilityMatchNo: similarMatches.length,
      }

      console.log('>>>>>prediction: ', prediction)

      await updateMatchRecordPrediction(prediction, tableName)
    }

    return 'please run getPredictionsTT'
  }

  async getMatchesPredictions(sport: string) {
    var tableName = 'table_tennis_matches'
    if (sport === 'tennis') {
      tableName = 'tennis_matches'
    }

    const waitingQueryResultAfterPrediction = await getPendingMatchRecords(tableName)

    //toCSV
    const forCsv = waitingQueryResultAfterPrediction.map(item => {

      return {
        time: new Date(Date.parse(item.match_time)).toLocaleDateString('en-GB', { hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit' }),
        p1Name: item.p1_name,
        p2Name: item.p2_name,
        p1LastGameWon: item.p1_last_game_won,
        p2LastGameWon: item.p2_last_game_won,
        p1LastGameSetScore: item.p1_last_game_set_score,
        p2LastGameSetScore: item.p2_last_game_set_score,
        p1LastGameOpponentName: item.p1_last_game_opponent_name,
        p2LastGameOpponentName: item.p2_last_game_opponent_name,
        h2hP1: item.h2h_p1,
        h2hP2: item.h2h_p2,
        bmP1: item.bm_p1,
        bmP2: item.bm_p2,
        l10P1: item.l10_p1,
        l10P2: item.l10_p2,
        p1WonWon: item.p1_won_won,
        p1WonLost: item.p1_won_lost,
        p1LostWon: item.p1_lost_won,
        p1LostLost: item.p1_lost_lost,
        p2WonWon: item.p2_won_won,
        p2WonLost: item.p2_won_lost,
        p2LostWon: item.p2_lost_won,
        p2LostLost: item.p2_lost_lost,
        predictionP1Win: item.prediction_p1_win,
        predictionMatchNo: item.prediction_match_no,
      }
    })

    return toTTPredCsv(forCsv)
  }

  async getPlayersName() {
    const queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/146261234111/tennis-player-url-queue'
    const client = new SQSClient({ region: 'ap-southeast-2' });

    // purge player name on queue
    const params = {
      QueueUrl: queueUrl, // URL of the queue to be purged
    };

    try {
      const purgeCommand = new PurgeQueueCommand(params);
      await client.send(purgeCommand);
      console.log(`Queue purged: ${queueUrl}`);
    } catch (err) {
      console.error("Error purging queue:", err);
    }

    // get all player from dynamodb that
    // does not have url and found is true
    const scanParam = {
      FilterExpression: 'url_found = :url_found AND attribute_not_exists(tennislive_url)',
      ExpressionAttributeValues: {
        ':url_found': { BOOL: true },
      },
      ProjectionExpression: 'id, full_name, url_found, tennislive_url',
      TableName: 'tennis_players',
    }
    const result = await executeScan(scanParam)

    // if url is not exist then push name to sqs
    result['Items'].forEach(async item => {
      const input = {
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify({
          id: item['id']['S'],
          url_found: item['url_found']['BOOL'],
          full_name: item['full_name']['S']
        }),
        DelaySeconds: 10,
      };
      const command = new SendMessageCommand(input);
      await client.send(command);
    })

    return `${result['Count']} players on queue.`
  }

  async getResults() {
    // get all player names from csv file on s3
    var fPlayers = []
    const todayCsv = await new S3ClientCustom().getFile('tennis-match-finished', 'today.csv')
    const processFile = async () => {
      const records = []
      const parser = Readable.from(todayCsv)
        .pipe(parse())
      for await (const record of parser) {
        records.push(record)
      }
      return records
    }

    await (async () => {
      const records = await processFile();

      for (var i = 1; i < records.length; i++) {
        fPlayers.push({ fp: records[i][36], nfp: records[i][47] })
      }
    })()

    console.log('get url for each f player')
    for (var i = 0; i < fPlayers.length; i++) {
      console.log(fPlayers[i].fp)
      const scanParam = {
        FilterExpression: 'full_name = :nameValue',
        ExpressionAttributeValues: {
          ':nameValue': { S: fPlayers[i].fp }
        },
        ProjectionExpression: 'id, full_name, url_found, tennislive_url',
        TableName: 'tennis_players',
      }

      const resultScan = await executeScan(scanParam)

      if (resultScan.Items[0] !== undefined) {
        fPlayers[i]['url'] = resultScan.Items[0]['tennislive_url']['S']
      }
    }

    console.log('>>>>get latest result for each player')
    for (var i = 0; i < fPlayers.length; i++) {
      console.log(fPlayers[i].nfp)
      try {
        const player1 = await new TennisliveClient().getPlayer(fPlayers[i]['url'])
        if (player1.parsedPreviousMatches[0].player.name === fPlayers[i].nfp) {
          fPlayers[i]['result'] = player1.parsedPreviousMatches[0].result.toLowerCase() === 'win' ? 1 : -1
        }
      } catch (ex) {
        console.error('>>>>>failed to get player result')
        continue
      }
    }

    // return csv file
    return fPlayers.map(p => [p.fp, p.result]).join('\r\n')

  }

  async getPlayersUrl() {
    const queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/146261234111/tennis-player-url-queue'
    const client = new SQSClient({ region: 'ap-southeast-2' });

    // check queue in SQS
    const getQueueAttrCommand = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['All']
    });

    var getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
    var sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)


    while (sqsMessageNumber > 0) {
      const receiveMessageCommand = new ReceiveMessageCommand({
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ["All"],
        QueueUrl: queueUrl,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 20,
      })

      const receiveMessageCommandResult = await client.send(receiveMessageCommand);
      var player = JSON.parse(receiveMessageCommandResult.Messages[0].Body)

      var tennisLiveUrl = await new TennisliveClient().getPlayerUrl(player['full_name'])

      var urlFound = true
      if (tennisLiveUrl === null || tennisLiveUrl === undefined || tennisLiveUrl === 'too many result') {
        tennisLiveUrl = 'not found'
        urlFound = false
      }

      // insert to dynamodb
      const player1 = {
        id: player['id'],
        full_name: player['full_name'],
        url_found: urlFound,
        tennislive_url: tennisLiveUrl
      }

      await putItem('tennis_players', player1, true)

      await client.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: receiveMessageCommandResult.Messages[0].ReceiptHandle,
        }),
      );

      getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
      sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)
    }

    return `${sqsMessageNumber} players on queue.`
  }

  async getSchedule() {
    const s3ClientCustom = new S3ClientCustom()

    var requestResult = 'error'
    const resultFile = await s3ClientCustom.getFile('tennis-match-schedule', 'result.json')

    if (resultFile) {
      return toCsv(resultFile)
    }

    const queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/146261234111/tennis-match-schedule-queue'
    const client = new SQSClient({ region: 'ap-southeast-2' });

    // const sportEvents = await new TennisliveClient().getSchedule()
    const events = await new BetapiClient().getEvents('13')
    const fileList = await new S3ClientCustom().getFileList('tennis-match-schedule')

    const sportEvents = []

    // check queue in SQS
    const getQueueAttrCommand = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['All']
    });

    var getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
    var sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)

    if (sqsMessageNumber === 0) {
      for await (const event of events) {
        const eventDateTime = new Date(parseInt(event.time) * 1000).toLocaleString('en-GB', { timeZone: 'Australia/Sydney' })
        const eventDate = eventDateTime.split(',')[0].trim()

        if (event.player1.name.includes('/')) {
          continue
        }

        if (eventDate !== '08/01/2025') {
          continue
        }

        const query1 = {
          KeyConditionExpression: '#id = :id',
          ExpressionAttributeNames: {
            '#id': 'id'
          },
          ExpressionAttributeValues: {
            ':id': { S: event.player1.id }
          },
          ProjectionExpression: 'id, full_name, url_found, tennislive_url',
          TableName: 'tennis_players',
        }
        const result1 = await executeQuery(query1)

        const query2 = {
          KeyConditionExpression: '#id = :id',
          ExpressionAttributeNames: {
            '#id': 'id'
          },
          ExpressionAttributeValues: {
            ':id': { S: event.player2.id }
          },
          ProjectionExpression: 'id, full_name, url_found, tennislive_url',
          TableName: 'tennis_players',
        }

        const result2 = await executeQuery(query2)

        const p1Record = result1.Items[0]
        const p2Record = result2.Items[0]

        if (!(p1Record['url_found']['BOOL'] && p2Record['url_found']['BOOL'])) {
          continue
        }

        const sportEvent = playerNamesToSportEvent(event.player1.id,
          p1Record['tennislive_url']['S'],
          event.player1.name,
          event.player2.id,
          p2Record['tennislive_url']['S'],
          event.player2.name,
        )

        sportEvent.id = event.id
        sportEvent.date = eventDateTime.split(',')[0].trim()
        sportEvent.time = eventDateTime.split(',')[1].trim()
        sportEvent.stage = event.stage

        sportEvents.push(sportEvent)
      }
    }

    const fileContent = []

    console.log('>>>>total schedule number: ', sportEvents.length)
    console.log('>>>>checked number: ', fileList.length)

    if (sqsMessageNumber === 0 && 271 === fileList.length) {
      await Promise.all(
        fileList.map(async file => {
          const content = await new S3ClientCustom().getFile('tennis-match-schedule', file)
          fileContent.push(JSON.parse(content))
        })
      )

      fileContent.forEach(content => {
        var parsed = null

        try {
          parsed = JSON.parse(content)
          fileContent.push(parsed)
        } catch (ex) {
          console.error('>>>>>failed to parse content')
          return
        }
      })

      await new S3ClientCustom()
        .putFile('tennis-match-schedule', 'result.json', JSON.stringify(fileContent))

      return fileContent
    }


    // check queue in SQS
    var getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
    var sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)

    if (sqsMessageNumber === 0) {
      // get schedule and put it in the SQS
      // this part will not timeout
      await Promise.all(
        sportEvents.map(async sporte => {
          const input = {
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(sporte),
            DelaySeconds: 10,
          };
          const command = new SendMessageCommand(input);
          await client.send(command);
        })
      )

      return 'message queue successfully'

    } else {
      // loop while sqs has message
      // this part might timeout after 15mins
      while (sqsMessageNumber > 0) {
        const receiveMessageCommand = new ReceiveMessageCommand({
          MaxNumberOfMessages: 1,
          MessageAttributeNames: ["All"],
          QueueUrl: queueUrl,
          WaitTimeSeconds: 20,
          VisibilityTimeout: 20,
        })

        const receiveMessageCommandResult = await client.send(receiveMessageCommand);
        var sportEvent = JSON.parse(receiveMessageCommandResult.Messages[0].Body)

        try {
          var checkPlayerResult = await new PlayerAdapter().checkSportEvent(sportEvent)

          await new S3ClientCustom()
            .putFile('tennis-match-schedule',
              sportEvent.id + '.json',
              JSON.stringify(checkPlayerResult))
        } catch (ex) {
          console.error('>>>>>check sport event parse error>>>', sportEvent.id)
          console.error(ex)
          await new S3ClientCustom()
            .putFile('tennis-match-schedule',
              sportEvent.id + '.json',
              JSON.stringify(sportEvent))
        }

        await client.send(
          new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: receiveMessageCommandResult.Messages[0].ReceiptHandle,
          }),
        );

        getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
        sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)
      }
    }

    return requestResult
  }

  async getScheduleTennis() {
    const s3ClientCustom = new S3ClientCustom()

    var requestResult = 'error'
    const resultFile = await s3ClientCustom.getFile('tennis-match-schedule', 'result.json')

    if (resultFile) {
      return toTTCsv(resultFile)
    }

    const queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/146261234111/tennis-match-schedule-queue'
    const client = new SQSClient({ region: 'ap-southeast-2' });

    const events = await new BetapiClient().getEvents('13')

    const sportEvents = []

    // check queue in SQS
    const getQueueAttrCommand = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['All']
    })

    const fileList = await new S3ClientCustom().getFileList('tennis-match-schedule')

    var getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
    var sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)

    if (sqsMessageNumber === 0) {
      for await (const event of events) {
        const eventDateTime = new Date(parseInt(event.time) * 1000).toLocaleString('en-GB', { timeZone: 'Australia/Sydney' })
        const eventDate = eventDateTime.split(',')[0].trim()

        if (event.player1.name.includes('/')) {
          continue
        }

        if (eventDate !== this.currentCheckDate) {
          continue
        }

        const sportEvent = {
          id: event.id,
          date: eventDateTime.split(',')[0].trim(),
          time: eventDateTime.split(',')[1].trim(),
          stage: '',
          url: '',
          type: '13',
          competitionName: '',
          player1: {
            id: event.player1.id,
            name: event.player1.name,
            country: '',
            dob: '',
            currentRanking: 0,
            highestRanking: 0,
            matchesTotal: 0,
            matchesWon: 0,
            url: '',
            type: '',
            prizeMoney: 0,
            previousMatches: null,
            parsedPreviousMatches: null,
            incomingMatchUrl: '',
            h2h: 0,
          },
          player2: {
            id: event.player2.id,
            name: event.player2.name,
            country: '',
            dob: '',
            currentRanking: 0,
            highestRanking: 0,
            matchesTotal: 0,
            matchesWon: 0,
            url: '',
            type: '',
            prizeMoney: 0,
            previousMatches: null,
            parsedPreviousMatches: null,
            incomingMatchUrl: '',
            h2h: 0
          }
        }


        sportEvents.push(sportEvent)
      }
    }

    const fileContent = []

    console.log('>>>>total schedule number: ', sportEvents.length)

    if (sqsMessageNumber === 0 && this.matchNoTennis === fileList.length) {
      await Promise.all(
        fileList.map(async file => {
          const content = await new S3ClientCustom().getFile('tennis-match-schedule', file)
          fileContent.push(JSON.parse(content))
        })
      )

      fileContent.forEach(content => {
        var parsed = null

        try {
          parsed = JSON.parse(content)
          fileContent.push(parsed)
        } catch (ex) {
          console.error('>>>>>failed to parse content')
          return
        }
      })

      await new S3ClientCustom()
        .putFile('tennis-match-schedule', 'result.json', JSON.stringify(fileContent))

      insertMatchRecords(fileContent, 'tennis_matches')

      return fileContent
    }

    // check queue in SQS
    var getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
    var sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)

    if (sqsMessageNumber === 0) {
      // get schedule and put it in the SQS
      // this part will not timeout
      await Promise.all(
        sportEvents.map(async sporte => {
          const input = {
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(sporte),
            DelaySeconds: 10,
          };
          const command = new SendMessageCommand(input);
          await client.send(command);
        })
      )

      return 'message queue successfully'

    }
    else {
      // loop while sqs has message
      // this part might timeout after 15mins
      while (sqsMessageNumber > 0) {
        const receiveMessageCommand = new ReceiveMessageCommand({
          MaxNumberOfMessages: 1,
          MessageAttributeNames: ["All"],
          QueueUrl: queueUrl,
          WaitTimeSeconds: 20,
          VisibilityTimeout: 20,
        })

        const receiveMessageCommandResult = await client.send(receiveMessageCommand);
        var sportEvent = JSON.parse(receiveMessageCommandResult.Messages[0].Body)

        try {
          var checkPlayerResult = await new PlayerAdapter().compareSportEvent(sportEvent)

          await new S3ClientCustom()
            .putFile('tennis-match-schedule',
              sportEvent.id + '.json',
              JSON.stringify(checkPlayerResult))
        } catch (ex) {
          console.error('>>>>>check sport event parse error>>>', sportEvent.id)
          console.error(ex)
          await new S3ClientCustom()
            .putFile('tennis-match-schedule',
              sportEvent.id + '.json',
              JSON.stringify(sportEvent))
        }

        await client.send(
          new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: receiveMessageCommandResult.Messages[0].ReceiptHandle,
          }),
        );

        getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
        sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)
      }
    }

    return requestResult
  }

  async getScheduleTT() {
    const s3ClientCustom = new S3ClientCustom()

    var requestResult = 'error'
    const resultFile = await s3ClientCustom.getFile('table-tennis-match-schedule', 'result.json')

    if (resultFile) {
      // await this.storeToDynamoDB(resultFile)

      insertMatchRecords(JSON.parse(resultFile), 'table_tennis_matches')
      return toTTCsv(resultFile)
    }

    const queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/146261234111/table-tennis-match-schedule-queue'
    const client = new SQSClient({ region: 'ap-southeast-2' });

    const events = await new BetapiClient().getEvents('92')

    const sportEvents = []

    // check queue in SQS
    const getQueueAttrCommand = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['All']
    })

    const fileList = await new S3ClientCustom().getFileList('table-tennis-match-schedule')

    var getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
    var sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)

    if (sqsMessageNumber === 0) {
      for await (const event of events) {
        const eventDateTime = new Date(parseInt(event.time) * 1000).toLocaleString('en-GB', { timeZone: 'Australia/Sydney' })

        if (event.player1.name.includes('/')) {
          continue
        }

        const now = Date.now()
        const checkStart = new Date(now)
        checkStart.setMinutes(checkStart.getMinutes() + 15)
        const checkEnd = new Date(now)
        checkEnd.setMinutes(checkEnd.getMinutes() + 45)
        if ((parseInt(event.time) * 1000) < checkStart.getTime() ||
          (parseInt(event.time) * 1000) > checkEnd.getTime()) {
          continue
        }

        const sportEvent = {
          id: event.id,
          date: eventDateTime.split(',')[0].trim(),
          time: eventDateTime.split(',')[1].trim(),
          stage: '',
          url: '',
          type: '92',
          competitionName: '',
          player1: {
            id: event.player1.id,
            name: event.player1.name,
            country: '',
            dob: '',
            currentRanking: 0,
            highestRanking: 0,
            matchesTotal: 0,
            matchesWon: 0,
            url: '',
            type: '',
            prizeMoney: 0,
            previousMatches: null,
            parsedPreviousMatches: null,
            incomingMatchUrl: '',
            h2h: 0,
          },
          player2: {
            id: event.player2.id,
            name: event.player2.name,
            country: '',
            dob: '',
            currentRanking: 0,
            highestRanking: 0,
            matchesTotal: 0,
            matchesWon: 0,
            url: '',
            type: '',
            prizeMoney: 0,
            previousMatches: null,
            parsedPreviousMatches: null,
            incomingMatchUrl: '',
            h2h: 0
          }
        }


        sportEvents.push(sportEvent)
      }
    }

    console.log('>>>>sportEvents: ', sportEvents.length)

    const fileContent = []

    let matchNoTT = 0
    let content = await new S3ClientCustom().getFile('table-tennis-match-schedule', 'number.txt')
    matchNoTT = Number(content)
    if (content === null || content === undefined) {
      await new S3ClientCustom()
        .putFile('table-tennis-match-schedule', 'number.txt', `${sportEvents.length}`)
    }

    console.log('>>>>sqsMessageNumber: ', sqsMessageNumber)
    console.log('>>>>matchNoTT: ', matchNoTT)
    console.log('>>>>fileList.length: ', fileList.length - 1)

    if (sqsMessageNumber === 0 && matchNoTT === (fileList.length - 1)) {
      await Promise.all(
        fileList.map(async file => {
          const content = await new S3ClientCustom().getFile('table-tennis-match-schedule', file)
          fileContent.push(JSON.parse(content))
        })
      )

      fileContent.forEach(content => {
        var parsed = null

        try {
          parsed = JSON.parse(content)
          fileContent.push(parsed)
        } catch (ex) {
          console.error('>>>>>failed to parse content')
          return
        }
      })

      await new S3ClientCustom()
        .putFile('table-tennis-match-schedule', 'result.json', JSON.stringify(fileContent))

      insertMatchRecords(fileContent, 'table_tennis_matches')

      return fileContent
    }


    // check queue in SQS
    var getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
    var sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)

    if (sqsMessageNumber === 0) {
      // get schedule and put it in the SQS
      // this part will not timeout
      await Promise.all(
        sportEvents.map(async sporte => {
          const input = {
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(sporte),
            DelaySeconds: 10,
          };
          const command = new SendMessageCommand(input);
          await client.send(command);
        })
      )

      return 'message queue successfully'

    }
    else {
      // loop while sqs has message
      // this part might timeout after 15mins
      while (sqsMessageNumber > 0) {
        const receiveMessageCommand = new ReceiveMessageCommand({
          MaxNumberOfMessages: 1,
          MessageAttributeNames: ["All"],
          QueueUrl: queueUrl,
          WaitTimeSeconds: 20,
          VisibilityTimeout: 20,
        })

        const receiveMessageCommandResult = await client.send(receiveMessageCommand);
        var sportEvent = JSON.parse(receiveMessageCommandResult.Messages[0].Body)

        try {
          var checkPlayerResult = await new PlayerAdapter().compareSportEvent(sportEvent)

          await new S3ClientCustom()
            .putFile('table-tennis-match-schedule',
              sportEvent.id + '.json',
              JSON.stringify(checkPlayerResult))
        } catch (ex) {
          console.error('>>>>>check sport event parse error>>>', sportEvent.id)
          console.error(ex)
          await new S3ClientCustom()
            .putFile('table-tennis-match-schedule',
              sportEvent.id + '.json',
              JSON.stringify(sportEvent))
        }

        await client.send(
          new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: receiveMessageCommandResult.Messages[0].ReceiptHandle,
          }),
        );

        getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
        sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)
      }
    }

    return requestResult
  }

  async getScheduleEsports() {
    const s3ClientCustom = new S3ClientCustom()

    var requestResult = 'error'
    const resultFile = await s3ClientCustom.getFile('esports-match-schedule', 'result.json')

    if (resultFile) {
      return toTTCsv(resultFile)
    }

    const queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/146261234111/esports-match-schedule-queue'
    const client = new SQSClient({ region: 'ap-southeast-2' });

    const events = await new BetapiClient().getEvents('151')

    const sportEvents = []

    // check queue in SQS
    const getQueueAttrCommand = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['All']
    })

    const fileList = await new S3ClientCustom().getFileList('esports-match-schedule')

    var getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
    var sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)

    if (sqsMessageNumber === 0) {
      for await (const event of events) {
        const eventDateTime = new Date(parseInt(event.time) * 1000).toLocaleString('en-GB', { timeZone: 'Australia/Sydney' })
        const eventDate = eventDateTime.split(',')[0].trim()

        if (event.player1.name.includes('/')) {
          continue
        }

        if (eventDate !== this.currentCheckDate) {
          continue
        }

        const sportEvent = {
          id: event.id,
          date: eventDateTime.split(',')[0].trim(),
          time: eventDateTime.split(',')[1].trim(),
          stage: '',
          url: '',
          type: '151',
          competitionName: '',
          player1: {
            id: event.player1.id,
            name: event.player1.name,
            country: '',
            dob: '',
            currentRanking: 0,
            highestRanking: 0,
            matchesTotal: 0,
            matchesWon: 0,
            url: '',
            type: '',
            prizeMoney: 0,
            previousMatches: null,
            parsedPreviousMatches: null,
            incomingMatchUrl: '',
            h2h: 0,
          },
          player2: {
            id: event.player2.id,
            name: event.player2.name,
            country: '',
            dob: '',
            currentRanking: 0,
            highestRanking: 0,
            matchesTotal: 0,
            matchesWon: 0,
            url: '',
            type: '',
            prizeMoney: 0,
            previousMatches: null,
            parsedPreviousMatches: null,
            incomingMatchUrl: '',
            h2h: 0
          }
        }


        sportEvents.push(sportEvent)
      }
    }

    const fileContent = []

    console.log('>>>>total schedule number: ', sportEvents.length)

    if (sqsMessageNumber === 0 && this.matchNoEsports === fileList.length) {
      await Promise.all(
        fileList.map(async file => {
          const content = await new S3ClientCustom().getFile('esports-match-schedule', file)
          fileContent.push(JSON.parse(content))
        })
      )

      fileContent.forEach(content => {
        var parsed = null

        try {
          parsed = JSON.parse(content)
          fileContent.push(parsed)
        } catch (ex) {
          console.error('>>>>>failed to parse content')
          return
        }
      })

      await new S3ClientCustom()
        .putFile('esports-match-schedule', 'result.json', JSON.stringify(fileContent))

      return fileContent
    }


    // check queue in SQS
    var getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
    var sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)

    if (sqsMessageNumber === 0) {
      // get schedule and put it in the SQS
      // this part will not timeout
      await Promise.all(
        sportEvents.map(async sporte => {
          const input = {
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(sporte),
            DelaySeconds: 10,
          };
          const command = new SendMessageCommand(input);
          await client.send(command);
        })
      )

      return 'message queue successfully'

    }
    else {
      // loop while sqs has message
      // this part might timeout after 15mins
      while (sqsMessageNumber > 0) {
        const receiveMessageCommand = new ReceiveMessageCommand({
          MaxNumberOfMessages: 1,
          MessageAttributeNames: ["All"],
          QueueUrl: queueUrl,
          WaitTimeSeconds: 20,
          VisibilityTimeout: 20,
        })

        const receiveMessageCommandResult = await client.send(receiveMessageCommand);
        var sportEvent = JSON.parse(receiveMessageCommandResult.Messages[0].Body)

        try {
          var checkPlayerResult = await new PlayerAdapter().compareSportEvent(sportEvent)

          await new S3ClientCustom()
            .putFile('esports-match-schedule',
              sportEvent.id + '.json',
              JSON.stringify(checkPlayerResult))
        } catch (ex) {
          console.error('>>>>>check sport event parse error>>>', sportEvent.id)
          console.error(ex)
          await new S3ClientCustom()
            .putFile('esports-match-schedule',
              sportEvent.id + '.json',
              JSON.stringify(sportEvent))
        }

        await client.send(
          new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: receiveMessageCommandResult.Messages[0].ReceiptHandle,
          }),
        );

        getQueueAttrCommandResponse = await client.send(getQueueAttrCommand);
        sqsMessageNumber = Number(getQueueAttrCommandResponse.Attributes.ApproximateNumberOfMessages)
      }
    }

    return requestResult
  }

  async getTableTennisSchedule() {
    const fileName = await new S3ClientCustom().getLatestModified('table-tennis-match-schedule')
    const content = await new S3ClientCustom().getFile('table-tennis-match-schedule', fileName)

    const response = await new BetapiClient().parseTableTennisEvent(content)


    return response
  }

  async getTableTennisNext() {
    const events = await new BetapiClient().getEvents('92')

    const latestEvents = events.filter(event => parseInt(event.time) > Date.now() / 1000)
    const sorted = latestEvents.sort((a, b) => parseInt(a.time) - parseInt(b.time))

    sorted.map(event => {
      const eventDateTime = new Date(parseInt(event.time) * 1000).toLocaleString('en-GB', { timeZone: 'Australia/Sydney' })
      event.time = eventDateTime
    })

    return sorted
  }

  async storeToDynamoDB(resultFile: any) {
    const events = JSON.parse(resultFile)

    const putEvents = events.map(event => {
      if (event.p1Name !== null && event.p1Name !== undefined && event.p1Name !== '' &&
        event.p2Name !== null && event.p2Name !== undefined && event.p2Name !== '') {
        return putItem('table_tennis_h2h_bm', event)
      }
    })

    console.log('>>>>put table tennis Events: ', putEvents.length)

    await Promise.all(putEvents)
  }

  async getPendingResults(sport: string) {

    var tableName = 'table_tennis_matches'
    if (sport === 'tennis') {
      tableName = 'tennis_matches'
    }

    const pendingMatchesResult = await getPendingMatchRecords(tableName)

    for (const match of pendingMatchesResult) {

      const event = {
        id: match.id,
        date: '',
        time: '',
        stage: '',
        url: '',
        type: sport === 'tennis' ? '13' : '92',
        competitionName: '',
        player1: {
          id: match.p1_id,
          name: match.p1_name,
          country: '',
          dob: '',
          currentRanking: 0,
          highestRanking: 0,
          matchesTotal: 0,
          matchesWon: 0,
          url: '',
          type: '',
          prizeMoney: 0,
          previousMatches: null,
          parsedPreviousMatches: null,
          incomingMatchUrl: '',
          h2h: 0,
        },
        player2: {
          id: match.p2_id,
          name: match.p2_name,
          country: '',
          dob: '',
          currentRanking: 0,
          highestRanking: 0,
          matchesTotal: 0,
          matchesWon: 0,
          url: '',
          type: '',
          prizeMoney: 0,
          previousMatches: null,
          parsedPreviousMatches: null,
          incomingMatchUrl: '',
          h2h: 0
        }
      }

      const result = await new PlayerAdapter().getResult(event);

      console.log('>>>result ', result)

      if (result !== null) {
        await updateMatchRecordWinner(result, tableName)
      }
    }

    return `${pendingMatchesResult.length} rows of ${tableName} result filled`

  }
}

