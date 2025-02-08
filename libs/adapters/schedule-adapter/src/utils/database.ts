import { Client } from 'pg'

export const insertMatchRecords = async (matches: Array<any>, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()

    for (const match of matches) {

        if (match['p1Consistency'] === undefined || match['p2Consistency'] === undefined) {
            continue
        }

        let tableTennisAttributes = ''
        let tableTennisValues = ''
        if (tableName === 'table_tennis_matches') {
            tableTennisAttributes = ', p1_last_game_won, p2_last_game_won, p1_last_game_set_score, p2_last_game_set_score, p1_last_game_opponent_name, p2_last_game_opponent_name'
            tableTennisValues = `, ${match['p1LastGameWon']}, ${match['p2LastGameWon']}, 
                '${match['p1LastGameSetScore']}', '${match['p2LastGameSetScore']}', 
                '${match['p1LastGameOpponentName']}', '${match['p2LastGameOpponentName']}'`
        }

        try {
            const unixTime = Date.parse(`${match['date']} ${match['time']}`)
            const timestamp = new Date(unixTime)
            const localTimestamp = timestamp.toLocaleDateString('en-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit' })
            const sql = `INSERT INTO ${tableName} (id, match_time, p1_id, p2_id, p1_name, p2_name, h2h_p1, h2h_p2, bm_p1, bm_p2, l10_p1, l10_p2,
                    p1_won_won, p1_won_lost, p1_lost_won, p1_lost_lost,
                    p2_won_won, p2_won_lost, p2_lost_won, p2_lost_lost ${tableTennisAttributes})
                VALUES ('${match['id']}', '${localTimestamp}', '${match['p1Id']}', '${match['p2Id']}', '${match['p1Name']}', '${match['p2Name']}', 
                    ${match['h2hP1']}, ${match['h2hP2']}, ${match['bmP1']}, ${match['bmP2']}, ${match['p1L10']}, ${match['p2L10']},
                    ${match['p1Consistency']['wonWon']}, ${match['p1Consistency']['wonLost']}, ${match['p1Consistency']['lostWon']}, ${match['p1Consistency']['lostLost']},
                    ${match['p2Consistency']['wonWon']}, ${match['p2Consistency']['wonLost']}, ${match['p2Consistency']['lostWon']}, ${match['p2Consistency']['lostLost']} 
                    ${tableTennisValues})`
            await connection.query(sql)
        } catch (error) {
            console.error('error cannot insert', error);
            continue
        }
    }

    await connection.end()
}


export const updateMatchRecordPrediction = async (matchPred: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `UPDATE ${tableName} SET prediction_p1_win = ${matchPred.p1Probability}, prediction_match_no = '${matchPred.probabilityMatchNo}' WHERE id = '${matchPred.id}'`
    await connection.query(sql)
    await connection.end()
}

export const updateMatchRecordWinner = async (matchStatus: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `UPDATE ${tableName} SET winner = ${matchStatus.winner}, set_score = '${matchStatus.setScore}' WHERE id = '${matchStatus.id}'`
    await connection.query(sql)
    await connection.end()
}

export const getPendingMatchRecords = async (tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `SELECT * FROM ${tableName} WHERE winner IS NULL`
    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getSimilarMatch = async (match: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    const h2hGap = match.h2h_p1 - match.h2h_p2
    const bmGap = match.bm_p1 - match.bm_p2
    const l10Gap = match.l10_p1 - match.l10_p2

    await connection.connect()
    const sql = `select * from 
( select id , h2h_p1 - h2h_p2 as h2h_gap, bm_p1 - bm_p2 as bm_gap, l10_p1 - l10_p2 as l10_gap, winner from ${tableName} ) as matches_gap
where h2h_gap = ${h2hGap} and bm_gap = ${bmGap} and l10_gap = ${l10Gap} and winner is not null`

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}