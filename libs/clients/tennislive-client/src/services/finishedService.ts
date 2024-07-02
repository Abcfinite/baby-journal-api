import S3ClientCustom from "@abcfinite/s3-client-custom"
import HttpApiClient from "@abcfinite/http-api-client"
import ScheduleParser from "../parsers/sportEventParser"
import { SportEvent } from '../types/sportEvent';

export default class FinishedService {

  constructor() {
  }

  async getResult(se: SportEvent) : Promise<SportEvent> {
    const headers = {
      Host: 'www.tennislive.net',
      Referer: process.env.TENNISLIVE_HOST
    }

    const httpApiClient = new HttpApiClient()

    let result = await httpApiClient.get(
        process.env.TENNISLIVE_HOST!,
        se.url.replace(process.env.TENNISLIVE_HOST!, '') ,
        headers,
      )

    var htmlResult = result.value as string

    // console.log('>>>>htmlResult')
    // console.log(htmlResult.)

    return {} as SportEvent

  }

  async getFinished() : Promise<SportEvent[]> {
    const finishedHtmlfileList = await new S3ClientCustom().getFileList('tennis-match-finished-html')
    var htmlResult = ''

    if (finishedHtmlfileList.length === 0) {
      const headers = {
        Host: 'www.tennislive.net',
        Referer: process.env.TENNISLIVE_HOST
      }

      const httpApiClient = new HttpApiClient()

      let result = await httpApiClient.get(
          process.env.TENNISLIVE_HOST!,
          '/tennis_livescore.php?t=fin' ,
          headers,
        )

      htmlResult = result.value as string
      await new S3ClientCustom().putFile('tennis-match-finished-html', 'schedule.html', htmlResult)
    } else {
      htmlResult = await new S3ClientCustom().getFile('tennis-match-finished-html', finishedHtmlfileList[0])
    }

    return ScheduleParser.parse(htmlResult)
  }
}