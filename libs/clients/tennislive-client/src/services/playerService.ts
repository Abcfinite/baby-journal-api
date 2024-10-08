import HttpApiClient from '@abcfinite/http-api-client'
import { Player } from '../types/player'
import PlayerListParser from '../parsers/playerListParser';
import PlayerDetailParser from '../parsers/playerDetailParser';
import PlayerNotFound from '../errors/PlayerNotFound';

export default class PlayerService {

  constructor() {
  }

  async getPlayerUrl(playerName: string) : Promise<string> {
    const headers = {
      Host: 'www.tennislive.net',
      Referer: process.env.TENNISLIVE_HOST
    }

    const httpApiClient = new HttpApiClient()

    const result = await httpApiClient.get(
      process.env.TENNISLIVE_HOST!,
      process.env.TENNISLIVE_PATH+'?qe='+playerName,
      headers,
    )

    return PlayerListParser.parse(result.value as string, playerName)
  }

  async getPlayerDetailHtml(playerDetailUrl: string, keepPreviousMatches: boolean = true) : Promise<Player> {
    const headers = {
      Host: 'www.tennislive.net',
      Referer: process.env.TENNISLIVE_HOST
    }

    const httpApiClient = new HttpApiClient()

    let result = null

    try {
      result = await httpApiClient.get(
        process.env.TENNISLIVE_HOST!,
        playerDetailUrl.replace(process.env.TENNISLIVE_HOST!, '') ,
        headers,
      )
    } catch(ex) {
      if (ex.response.status == 404) {
        throw new PlayerNotFound()
      }
    }

    return PlayerDetailParser.parse(result.value as string, keepPreviousMatches)
  }
}
