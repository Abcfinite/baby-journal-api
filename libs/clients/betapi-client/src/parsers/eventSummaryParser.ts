import _ from 'lodash'
import { EventSummary } from '../types/eventSummary'

export default class EventSummaryParser {
    parse(event?: object): EventSummary {
        const p1Id = _.get(event, 'h2h[0].home.id', '')
        const p2Id = _.get(event, 'h2h[0].away.id', '')

        const scores = _.get(event, 'h2h', []).map((e: any) => e.ss)

        const h2hP1 = scores.map(score => {
            const p1Set = score.split(',')[0].split('-')[0]
            const p2Set = score.split(',')[0].split('-')[1]

            return p1Set > p2Set ? 1 : 0
        }).reduce((a, b) => a + b, 0)

        const h2hP2 = scores.length - h2hP1

        return {
            p1Id,
            p2Id,
            h2hP1,
            h2hP2
        }
    }
}
