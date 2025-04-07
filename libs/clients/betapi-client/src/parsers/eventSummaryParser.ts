import _ from 'lodash'
import { EventSummary } from '../types/eventSummary'

export default class EventSummaryParser {
    parse(pId: string, event?: object): EventSummary {

        var h2hP1 = 0

        _.get(event, 'h2h', []).forEach(h2h => {
            const h2hSS = _.get(h2h, 'ss', '')
            const h2hPart1 = h2hSS.split('-')[0]
            const h2hPart2 = h2hSS.split('-')[1]
            if (h2h.home.id === pId && h2hPart1 > h2hPart2) {
                h2hP1++
            }

            if (h2h.away.id === pId && h2hPart2 > h2hPart1) {
                h2hP1++
            }
        })

        const h2hP2 = _.get(event, 'h2h', []).length - h2hP1

        return {
            h2hP1,
            h2hP2
        }
    }
}
