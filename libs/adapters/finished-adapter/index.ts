import _ from "lodash"
import { putItem } from '@abcfinite/dynamodb-client'
import S3ClientCustom from '@abcfinite/s3-client-custom'
import TennisliveClient from '@abcfinite/tennislive-client'
import { Player } from '../../clients/tennislive-client/src/types/player'
import { SportEvent } from "@abcfinite/tennislive-client/src/types/sportEvent"
import PlayerAdapter from '@abcfinite/player-adapter'
import { getFinished } from '../../domains/sports/events/index';
import * as csv from 'fast-csv'
import * as fs from 'fs';
import { Readable } from 'stream'
import { SQSClient, SendMessageCommand,
  ReceiveMessageCommand, GetQueueAttributesCommand,
  DeleteMessageCommand } from "@aws-sdk/client-sqs";

export default class ScheduleAdapter {
  async getFinished() {
    const queueUrl = 'https://sqs.ap-southeast-2.amazonaws.com/146261234111/tennis-match-result-queue'
    const client = new SQSClient({ region: 'ap-southeast-2' });
    const sportEvents = await new TennisliveClient().getFinished()

    // check queue in SQS
    const getQueueAttrCommand = new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ['All']
    });

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
      while(sqsMessageNumber > 0) {
        const receiveMessageCommand  = new ReceiveMessageCommand({
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
            .putFile('tennis-match-finished',
            sportEvent.id+'.json',
              JSON.stringify(checkPlayerResult))
        } catch(ex) {
          await new S3ClientCustom()
            .putFile('tennis-match-finished',
            sportEvent.id+'.json',
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

    return sportEvents
  }

  async putValueSummary(valueSummary: {}) {
    const todayObj: Array<any> = await this.getToday()

    todayObj.forEach(row => {
      const summary = valueSummary[row.value]

      row['value-total'] = 0
      row['won-percentage'] = 0

      if (summary !== undefined && summary !== null) {
        row['value-total'] = summary.total
        row['won-percentage'] = summary.won_percentage
      }
    });

    return todayObj
  }

  async getToday(): Promise<Array<any>> {
    const csvFile = await new S3ClientCustom().getFile('tennis-match-schedule', 'today.csv') as any
    const rows = []

    return new Promise((resolve, reject) => {
      Readable.from(csvFile)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => reject(error))
      .on('data', row => this.dataReceived(row, rows))
      .on('end', _ => {
        resolve(rows)
      });
    })
  }

  async getValueSummary() {
    const csvFile = await new S3ClientCustom().getFile('tennis-match-finished', 'finished.csv') as any
    const rows = []

    return new Promise((resolve, reject) => {
      Readable.from(csvFile)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => reject(error))
      .on('data', row => this.dataReceived(row, rows))
      .on('end', _ => {
        resolve(this.valueSummaryEnd(rows))
      });
    })
  }

  async dataReceived(row, rows) {
    rows.push(row)
  }

  async valueSummaryEnd(rows) {
    const values = rows.map(row => row.value)
    const uniqueVal = [...new Set(values)]
    const valSet = {}

    console.log('>>>>rows')
    console.log(rows)

    uniqueVal.forEach(val => {
      const total = rows.filter(r => r.value === val ).length
      const won = rows.filter(r => r.value === val && r['r'] === '1').length
      const won_percentage = won/total * 100
      valSet[val as string] = {
        total,
        won,
        won_percentage
      }
    })

    return valSet
  }
}