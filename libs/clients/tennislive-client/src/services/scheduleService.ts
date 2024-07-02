import S3ClientCustom from "@abcfinite/s3-client-custom"
import HttpApiClient from "@abcfinite/http-api-client"
import ScheduleParser from "../parsers/sportEventParser"
import { SportEvent } from "../types/sportEvent"

export default class ScheduleService {

  constructor() {
  }

  async getSchedule() : Promise<SportEvent[]> {
    const scheduleHtmlfileList = await new S3ClientCustom().getFileList('tennis-match-schedule-html')
    var htmlResult = ''

    if (scheduleHtmlfileList.length === 0) {
      const headers = {
        Host: 'www.tennislive.net',
        Referer: process.env.TENNISLIVE_HOST
      }

      const httpApiClient = new HttpApiClient()

      let result = await httpApiClient.get(
          process.env.TENNISLIVE_HOST!,
          '/tennis_livescore.php?t=np' ,
          headers,
        )

      htmlResult = result.value as string
      await new S3ClientCustom().putFile('tennis-match-schedule-html', 'schedule.html', htmlResult)
    } else {
      htmlResult = await new S3ClientCustom().getFile('tennis-match-schedule-html', scheduleHtmlfileList[0])
    }

    return ScheduleParser.parse(htmlResult)
  }
}