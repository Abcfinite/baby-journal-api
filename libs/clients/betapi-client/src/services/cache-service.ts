import S3ClientCustom from '@abcfinite/s3-client-custom'
export default class CacheService {
    getEventCache = async (sportId: string): Promise<string> => {
        const dataFile = await new S3ClientCustom().getFile('betapi-cache', `${sportId}.json`) as any
        return dataFile
    }

    getBet365EventCache = async (sportId: string): Promise<string> => {
        const dataFile = await new S3ClientCustom().getFile('betapi-cache', `${sportId}-bet365.json`) as any
        return dataFile
    }

    deleteEventCache = async (sportId: string) => {
        await new S3ClientCustom().deleteAllFiles('betapi-cache')
    }

    setEventCache = async (sportId: string, events: string) => {
        await new S3ClientCustom().putFile('betapi-cache', `${sportId}.json`, events) as any
    }

    setBet365EventCache = async (sportId: string, events: string) => {
        await new S3ClientCustom().putFile('betapi-cache', `${sportId}-bet365.json`, events) as any
    }

    setPlayerCache = async (playerId: string, events: string) => {
        await new S3ClientCustom().putFile('betapi-cache', `ended/players/${playerId}.json`, events) as any
    }
}
