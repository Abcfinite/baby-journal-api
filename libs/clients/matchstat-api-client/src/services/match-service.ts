import HttpApiClient from '@abcfinite/http-api-client'

export default class MatchService {
    constructor() {}

    async getTodayMatch(type: 'wta' | 'atp' | 'itf' ,pageNo: string) {
        const httpApiClient = new HttpApiClient()

        const headers = {
          'x-rapidapi-host': 'tennis-api-atp-wta-itf.p.rapidapi.com',
          'x-rapidapi-key': '25a20073a7mshc8d4c9150074dbap1b8ae1jsnb855df84de3e'
        }

        let result = await httpApiClient.get(
            'https://tennis-api-atp-wta-itf.p.rapidapi.com',
            `/tennis/v2/${type}/fixtures/2024-07-19/2024-07-21?pageNo=${pageNo}`,
            headers,
          )

        return result
    }
}