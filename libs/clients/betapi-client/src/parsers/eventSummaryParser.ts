import _ from 'lodash'
import { EventSummary } from '../types/eventSummary'

export default class EventSummaryParser {
    parse(pId: string, event?: object): EventSummary {

        const homeMatches = _.get(event, 'home', [])
        const awayMatches = _.get(event, 'away', [])

        const homeIds = homeMatches.map(hm => hm.home.id)
        homeIds.concat(homeMatches.map(hm => hm.away.id))
        const awayIds = awayMatches.map(am => am.home.id)
        awayIds.concat(awayMatches.map(am => am.away.id))

        const mostCommonHome = this.getMostCommonMember(homeIds)
        const mostCommonAway = this.getMostCommonMember(awayIds)

        const p2Id = mostCommonHome === pId ? mostCommonAway : mostCommonHome

        var l10P1 = 0
        var l10P2 = 0

        var h2hP1 = 0

        console.log('>>>>pId : ', pId)
        console.log(_.get(event, 'h2h', []))

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



        homeMatches.forEach(hm => {
            const homeId = hm.home.id
            const awayId = hm.away.id

            if ((homeId === pId && this.isHomeWon(hm.ss)) || awayId === pId && !this.isHomeWon(hm.ss)) {
                l10P1++
            }

            if ((homeId === p2Id && this.isHomeWon(hm.ss)) || awayId === p2Id && !this.isHomeWon(hm.ss)) {
                l10P2++
            }
        })


        awayMatches.forEach(am => {
            const homeId = am.home.id
            const awayId = am.away.id

            if ((homeId === pId && this.isHomeWon(am.ss)) || awayId === pId && !this.isHomeWon(am.ss)) {
                l10P1++
            }

            if ((homeId === p2Id && this.isHomeWon(am.ss)) || awayId === p2Id && !this.isHomeWon(am.ss)) {
                l10P2++
            }
        })

        const result = {
            h2hP1,
            h2hP2,
            l10P1,
            l10P2,
        }

        console.log('>>>>result : ', result)

        return result
    }


    isHomeWon(ss: string): boolean {
        const sets = ss.split(',')

        var homeSetScore = 0
        var awaySetScore = 0

        sets.forEach(set => {
            const homeScore = set.split('-')[0]
            const awayScore = set.split('-')[1]

            if (homeScore > awayScore) {
                homeSetScore++
            } else {
                awaySetScore++
            }
        })

        return homeSetScore > awaySetScore
    }

    getMostCommonMember<T>(array: T[]): T | null {
        if (array.length === 0) return null;

        const frequencyMap: Record<string, number> = {};

        // Count occurrences of each element
        for (const item of array) {
            const key = JSON.stringify(item); // Use JSON.stringify to handle complex objects
            frequencyMap[key] = (frequencyMap[key] || 0) + 1;
        }

        // Find the element with the highest frequency
        let mostCommon: T | null = null;
        let maxCount = 0;

        for (const key in frequencyMap) {
            if (frequencyMap[key] > maxCount) {
                maxCount = frequencyMap[key];
                mostCommon = JSON.parse(key); // Parse back to the original type
            }
        }

        return mostCommon;
    }
}
