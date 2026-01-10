import _ from 'lodash'
import { EventSummary } from '../types/eventSummary'
import { EventPattern } from '../types/eventPattern'
import { Match } from '../types/betApiEvent'
import { parseMatch } from './matchParser'

export default class EventSummaryParser {
    parseWithoutId(event?: object): EventPattern {

        const h2hMatches: Match[] = _.get(event, 'h2h', []).map(parseMatch)

        const homeMatches: Match[] = _.get(event, 'home', []).map(parseMatch)
        var p1Id = this.findPersistentPlayerIds(homeMatches)

        const awayMatches: Match[] = _.get(event, 'away', []).map(parseMatch)
        var p2Id = this.findPersistentPlayerIds(awayMatches)


        
        console.log('>>>>p1Id : ', p1Id)
        console.log('>>>>p2Id : ', p2Id)

        return {
            p1Id: p1Id[0], p2Id: p2Id[0],
            winner: null, score: null,
            result1: this.wOrLH2H(h2hMatches[0], p1Id[0]), score1: h2hMatches[0].ss, result2: this.wOrLH2H(h2hMatches[1], p1Id[0]), score2: h2hMatches[1].ss, result3: this.wOrLH2H(h2hMatches[2], p1Id[0]), score3: h2hMatches[2].ss,
            result4: this.wOrLH2H(h2hMatches[3], p1Id[0]), score4: h2hMatches[3].ss, result5: this.wOrLH2H(h2hMatches[4], p1Id[0]), score5: h2hMatches[4].ss, result6: this.wOrLH2H(h2hMatches[5], p1Id[0]), score6: h2hMatches[5].ss,
            result7: this.wOrLH2H(h2hMatches[6], p1Id[0]), score7: h2hMatches[6].ss, result8: this.wOrLH2H(h2hMatches[7], p1Id[0]), score8: h2hMatches[7].ss,
            
            result9: this.wOrLH2H(homeMatches[0], p1Id[0]), score9: homeMatches[0].ss, result10: this.wOrLH2H(homeMatches[1], p1Id[0]), score10: homeMatches[1].ss,
            result11: this.wOrLH2H(homeMatches[2], p1Id[0]), score11: homeMatches[2].ss, result12: this.wOrLH2H(homeMatches[3], p1Id[0]), score12: homeMatches[3].ss,
            result13: this.wOrLH2H(homeMatches[4], p1Id[0]), score13: homeMatches[4].ss, result14: this.wOrLH2H(homeMatches[5], p1Id[0]), score14: homeMatches[5].ss, result15: this.wOrLH2H(homeMatches[6], p1Id[0]), score15: homeMatches[6].ss,
            result16: this.wOrLH2H(homeMatches[7], p1Id[0]), score16: homeMatches[7].ss,
            
            result17: this.wOrLH2H(awayMatches[0], p2Id[0]), score17: awayMatches[0].ss, result18: this.wOrLH2H(awayMatches[1], p2Id[0]), score18: awayMatches[1].ss,
            result19: this.wOrLH2H(awayMatches[2], p2Id[0]), score19: awayMatches[2].ss, result20: this.wOrLH2H(awayMatches[3], p2Id[0]), score20: awayMatches[3].ss, result21: this.wOrLH2H(awayMatches[4], p2Id[0]), score21: awayMatches[4].ss,
            result22: this.wOrLH2H(awayMatches[5], p2Id[0]), score22: awayMatches[5].ss, result23: this.wOrLH2H(awayMatches[6], p2Id[0]), score23: awayMatches[6].ss, result24: this.wOrLH2H(awayMatches[7], p2Id[0]), score24: awayMatches[7].ss,
            
            v1_p1_id: this.opponentId(p1Id[0], homeMatches[0]), v2_p1_id: this.opponentId(p1Id[0], homeMatches[1]), v3_p1_id: this.opponentId(p1Id[0], homeMatches[2]), v4_p1_id: this.opponentId(p1Id[0], homeMatches[3]),
            v5_p1_id: this.opponentId(p1Id[0], homeMatches[4]), v6_p1_id: this.opponentId(p1Id[0], homeMatches[5]), v7_p1_id: this.opponentId(p1Id[0], homeMatches[6]), v8_p1_id: this.opponentId(p1Id[0], homeMatches[7]),
            
            v1_p2_id: this.opponentId(p2Id[0], awayMatches[0]), v2_p2_id: this.opponentId(p2Id[0], awayMatches[1]), v3_p2_id: this.opponentId(p2Id[0], awayMatches[2]), v4_p2_id: this.opponentId(p2Id[0], awayMatches[3]),
            v5_p2_id: this.opponentId(p2Id[0], awayMatches[4]), v6_p2_id: this.opponentId(p2Id[0], awayMatches[5]), v7_p2_id: this.opponentId(p2Id[0], awayMatches[6]), v8_p2_id: this.opponentId(p2Id[0], awayMatches[7])
            
        }
    }

    opponentId(pxD: string, match: Match): string | null {
        if (match.home.id === pxD) {
            return match.away.id
        } else if (match.away.id === pxD) {
            return match.home.id
        }

        return null
    }

    wOrLH2H(match: Match, pxId: string): string | null { 
        return this.isP1IdWon(match, pxId) ? 'W' : 'L'
    }

    isP1IdWon(match: Match, p1Id: string): Boolean | null{
        if (match.home.id === p1Id && this.isHomeWon(match.ss)) {
            return true
        } else if (match.home.id === p1Id && !this.isHomeWon(match.ss)) {
            return false
        } else if (match.away.id === p1Id && this.isHomeWon(match.ss)) {
            return false
        } else if (match.away.id === p1Id && !this.isHomeWon(match.ss)) {
            return true
        }

        return null
    }


    findPersistentPlayerIds(matches: Match[]): string[] {
    if (matches.length === 0) return [];

    // Start with the two players from the very first match
    let commonIds = new Set<string>([matches[0].home.id, matches[0].away.id]);

    for (let i = 1; i < matches.length; i++) {
        const currentMatchIds = new Set<string>([matches[i].home.id, matches[i].away.id]);
        
        // Filter commonIds to only keep those present in the current match
        commonIds = new Set([...commonIds].filter(id => currentMatchIds.has(id)));

        // Optimization: if no common IDs remain, stop looking
        if (commonIds.size === 0) break;
    }

    return Array.from(commonIds);
}




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
