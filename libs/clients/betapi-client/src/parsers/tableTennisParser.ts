import { TableTennis } from "../types/tableTennis"
import { parse, Node } from 'node-html-parser'

export default class TableTennisParser {
    parse(html: string): TableTennis {

        const parsedMatchHtml = parse(html)

        const playerNames = parsedMatchHtml.getElementsByTagName('h3').map(h3 => h3.childNodes[0].text.trim())

        const p1Name = playerNames[0]
        const p2Name = playerNames[1]
        let h2hP1 = 0
        let h2hP2 = 0
        let bmP1 = 0
        let bmP2 = 0

        const tbodyElements = parsedMatchHtml.querySelectorAll('tbody')

        //head to head
        let h2hScores = []
        tbodyElements[0].childNodes.forEach(tr => {
            const parsedScore = this.parseH2HRow(p1Name, tr)
            if (parsedScore) {
                h2hScores.push(parsedScore)
            }
        })

        h2hScores.forEach(score => {
            if (parseInt(score[0]) > parseInt(score[1])) {
                h2hP1++
            } else {
                h2hP2++
            }
        })

        //home history
        let p1History = []
        tbodyElements[1].childNodes.forEach(tr => {
            const parsedScore = this.parsedPHistoryRow(p1Name, tr)
            if (parsedScore) {
                p1History.push(parsedScore)
            }
        })


        //away history
        let p2History = []
        tbodyElements[2].childNodes.forEach(tr => {
            const parsedScore = this.parsedPHistoryRow(p2Name, tr)
            if (parsedScore) {
                p2History.push(parsedScore)
            }
        })

        console.log('>>>>p1History - before')
        console.log(p1History)
        console.log('>>>>p2History - before')
        console.log(p2History)


        // make history unique
        p1History = this.uniqueHistory(p1History)
        p2History = this.uniqueHistory(p2History)

        console.log('>>>>p1History')
        console.log(p1History)
        console.log('>>>>p2History')
        console.log(p2History)


        // player1 bench mark
        p1History.reverse().forEach(history => {
            if (p2History.map(p2H => p2H[0]).includes(history[0])) {
                if (history[1][0] > history[1][1]) {
                    bmP1++
                }
            }
        })


        // player2 bench mark
        p2History.reverse().forEach(history => {
            if (p1History.map(p1H => p1H[0]).includes(history[0])) {
                if (history[1][0] > history[1][1]) {
                    bmP2++
                }
            }
        })


        let tennisTableResult = {
            p1Name,
            p2Name,
            h2hP1,
            h2hP2,
            bmP1,
            bmP2
        }

        return tennisTableResult
    }

    parseH2HRow(p1Name: string, row: Node) {
        if (row.childNodes.length === 0) return

        const p1NameTrimmed = p1Name.replaceAll(' ', '')

        const pNames = row.childNodes[5].text.replaceAll('\n', '').replaceAll(' ', '')
        const scores = row.childNodes[9].text.trim().split('-')

        if (pNames.substring(0, p1NameTrimmed.length) === p1NameTrimmed) {
            return [scores[0], scores[1]]
        }

        return [scores[1], scores[0]]
    }

    parsedPHistoryRow(playerName: string, row: Node) {
        if (row.childNodes.length === 0) return

        const pNameTrimmed = playerName.replaceAll(' ', '')

        const pNames = row.childNodes[5].text.replaceAll('\n', '').replaceAll(' ', '')
        const scores = row.childNodes[9].text.trim().split('-')

        if (pNames.substring(0, pNameTrimmed.length) === pNameTrimmed) {
            const opponentName = pNames.replace(pNameTrimmed, '').replace('v', '')
            return [opponentName, [scores[0], scores[1]]]
        }

        const opponentName = pNames.replace(pNameTrimmed, '').replace(/.$/, '')
        return [opponentName, [scores[1], scores[0]]]
    }

    uniqueHistory(history: Array<Array<string>>) {
        history.forEach(h => {
            const pName = h[0]
            const indexes = this.getAllIndexes(history.map(h => h[0]), pName)

            indexes.sort((a, b) => b - a)
            indexes.pop()

            indexes.forEach(i => {
                history.splice(i, 1)
            })
        })

        return history
    }

    getAllIndexes(arr, val) {
        var indexes = [], i = -1;
        while ((i = arr.indexOf(val, i + 1)) != -1) {
            indexes.push(i);
        }
        return indexes;
    }
}