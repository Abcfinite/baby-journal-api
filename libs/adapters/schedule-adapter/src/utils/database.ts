import { EventPattern } from "@abcfinite/betapi-client/src/types/eventPattern"
import _ from "lodash"
import { Client, Pool } from 'pg'


export const insertPatternRecords = async (matches: Array<EventPattern>) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()

    for (const match of matches) {
        const sql = `INSERT INTO public.table_tennis_pattern(
            id, winner, score, result1, score1, result2, score2, result3, score3, result4, score4, result5, score5, result6, score6, result7, score7, result8, score8
                , result9, score9, result10, score10, result11, score11, result12, score12, result13, score13, result14, score14, result15, score15
                , result16, score16, result17, score17, result18, score18, result19, score19, result20, score20, result21, score21, result22, score22, result23, score23, result24, score24
                , p1_id, p2_id, v1_p1_id, v2_p1_id, v3_p1_id, v4_p1_id, v5_p1_id, v6_p1_id, v7_p1_id, v8_p1_id, v1_p2_id, v2_p2_id, v3_p2_id, v4_p2_id, v5_p2_id, v6_p2_id, v7_p2_id, v8_p2_id)
        	VALUES (${match.id}, ${match.winner}, '${match.score}', '${match.result1}', '${match.score1}', '${match.result2}', '${match.score2}', '${match.result3}', '${match.score3}', '${match.result4}', '${match.score4}', '${match.result5}', '${match.score5}', '${match.result6}', '${match.score6}', '${match.result7}', '${match.score7}', '${match.result8}', '${match.score8}'
                , '${match.result9}', '${match.score9}', '${match.result10}', '${match.score10}', '${match.result11}', '${match.score11}', '${match.result12}', '${match.score12}', '${match.result13}', '${match.score13}', '${match.result14}', '${match.score14}', '${match.result15}', '${match.score15}'
                , '${match.result16}', '${match.score16}', '${match.result17}', '${match.score17}', '${match.result18}', '${match.score18}', '${match.result19}', '${match.score19}', '${match.result20}', '${match.score20}', '${match.result21}', '${match.score21}', '${match.result22}', '${match.score22}', '${match.result23}', '${match.score23}', '${match.result24}', '${match.score24}'
                , '${match.p1Id}', '${match.p2Id}', '${match.v1_p1_id}', '${match.v2_p1_id}', '${match.v3_p1_id}', '${match.v4_p1_id}', '${match.v5_p1_id}', '${match.v6_p1_id}', '${match.v7_p1_id}', '${match.v8_p1_id}', '${match.v1_p2_id}', '${match.v2_p2_id}', '${match.v3_p2_id}', '${match.v4_p2_id}', '${match.v5_p2_id}', '${match.v6_p2_id}', '${match.v7_p2_id}', '${match.v8_p2_id}');`

            console.log('>>>sql :', sql)

        try{
            await connection.query(sql)
        } catch (error) {
            console.error('error cannot insert', error);
            continue
        }
    }

    await connection.end()
}

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
            // var oddData = []

            // if (oddsData !== undefined && oddsData !== null) {
            //     oddData = oddsData.find((m) => m.player1.name = match['p1Name'] && m.player2.name === match['p2Name'])
            // }

            tableTennisAttributes = ', p1_last_game_won, p2_last_game_won, p1_last_game_set_score, p2_last_game_set_score, p1_last_game_opponent_name, p2_last_game_opponent_name, p1_p1last, p1_p2last, p1_p2last_1, p2_p1last, p2_p1last_1, p2_p2last, bm_player_names'
            tableTennisValues = `, ${match['p1LastGameWon']}, ${match['p2LastGameWon']}, 
                '${match['p1LastGameSetScore']}', '${match['p2LastGameSetScore']}', 
                '${match['p1LastGameOpponentName']}', '${match['p2LastGameOpponentName']}',
                '${match['p1P1Last'].join('')}', '${match['p1P2Last'].join('')}', '${match['p1P2Last_1'].join('')}', '${match['p2P1Last'].join('')}', '${match['p2P1Last_1'].join('')}', '${match['p2P2Last'].join('')}', '${match['bmPlayerNames'].join(', ')}'`
        }

        try {
            const parsedDate = match['date'].split('/')
            const formattedDate = `${parsedDate[2]}-${parsedDate[1]}-${parsedDate[0]}`
            const unixTime = Date.parse(`${formattedDate} ${match['time']}`)
            const timestamp = new Date(unixTime)
            const localTimestamp = timestamp.toLocaleDateString('en-ZA', { year: 'numeric', month: '2-digit',       day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit' })

            const sql = `INSERT INTO ${tableName} (id, match_time, p1_id, p2_id, p1_name, p2_name, odd_p1, odd_p2, odd_p1_2, odd_p2_2,h2h_p1, h2h_p2, bm_p1, bm_p2, h2h_last_won_player,l10_p1, l10_p2, l30_p1, l30_p2,
                    p1_won_won, p1_won_lost, p1_lost_won, p1_lost_lost,
                    p2_won_won, p2_won_lost, p2_lost_won, p2_lost_lost, p1_match_no, p2_match_no, p1_win_count, p2_win_count, p1_streak, p2_streak                    
                     ${tableTennisAttributes})
                VALUES ('${match['id']}', '${localTimestamp}', '${match['p1Id']}', '${match['p2Id']}', '${match['p1Name']}', '${match['p2Name']}', ${match['p1Odd']}, ${match['p2Odd']}, ${match['p1Odd2']}, ${match['p2Odd2']}, 
                    ${match['h2hP1']}, ${match['h2hP2']}, ${match['bmP1']}, ${match['bmP2']}, ${match['h2hLastWinner']}, ${match['p1L10']}, ${match['p2L10']}, ${match['p1L30']}, ${match['p2L30']},
                    ${match['p1Consistency']['wonWon']}, ${match['p1Consistency']['wonLost']}, ${match['p1Consistency']['lostWon']}, ${match['p1Consistency']['lostLost']},
                    ${match['p2Consistency']['wonWon']}, ${match['p2Consistency']['wonLost']}, ${match['p2Consistency']['lostWon']}, ${match['p2Consistency']['lostLost']},
                    ${match['p1MatchNo']}, ${match['p2MatchNo']}, ${match['p1WinCount']}, ${match['p2WinCount']}, '${match['p1Streak']}', '${match['p2Streak']}'
                    ${tableTennisValues})`

            console.log('>>>sql :', sql)

            await connection.query(sql)
        } catch (error) {
            console.error('error cannot insert', error);
            continue
        }
    }

    await connection.end()
}


export const updateMatchRecordPrediction = async (id: string, prediction: number) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `UPDATE table_tennis_matches 
        SET prediction_p2_win = ${prediction}
        WHERE id = '${id}'`

    // prediction_distances_last_match_p1_percentage = ${distancesScorePrediction !== undefined && distancesScorePrediction !== null ? distancesScorePrediction.p1Probability : 0},
    // prediction_distances_last_match_p1_match_no = ${distancesScorePrediction !== undefined && distancesScorePrediction !== null ? distancesScorePrediction.probabilityMatchNo : 0}


    console.log(sql)

    await connection.query(sql)
    await connection.end()
}

export const updateLessThanOneHalfRecordPrediction = async (id: string, prediction: number) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `UPDATE table_tennis_matches 
        SET prediction_p2_lost = ${prediction}
        WHERE id = '${id}'`

    console.log(sql)

    await connection.query(sql)
    await connection.end()
}


export const updateMatchRecPred = async (predH2hV1: any, predH2hStreak: any, similarRate: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `UPDATE ${tableName} 
        SET prediction_p1_win = ${predH2hV1 !== undefined && predH2hV1 !== null ? predH2hV1.p1Probability : 0},
            prediction_match_no = ${predH2hV1 !== undefined && predH2hV1 !== null ? predH2hV1.probabilityMatchNo : 0},
            prediction_2_p1_win = ${predH2hStreak !== undefined && predH2hStreak !== null ? predH2hStreak.p1Probability : 0},
            prediction_2_match_no = ${predH2hStreak !== undefined && predH2hStreak !== null ? predH2hStreak.probabilityMatchNo : 0},
            h2h_streak_win_rate = ${similarRate !== undefined && similarRate !== null ? similarRate.p1Probability : 0},
            h2h_streak_match_count = ${similarRate !== undefined && similarRate !== null ? similarRate.probabilityMatchNo : 0}
        WHERE id = '${predH2hV1.id}'`

    console.log(sql)

    await connection.query(sql)
    await connection.end()
}

export const updateMatchRecordPredictionAlt2 = async (matchPred: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `UPDATE ${tableName} SET prediction_2_p1_win = ${matchPred.p1Probability}, prediction_2_match_no = ${matchPred.probabilityMatchNo} WHERE id = '${matchPred.id}'`
    await connection.query(sql)
    await connection.end()
}

export const updateMatchRecordPredictionAlt2Rev = async (matchPred: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `UPDATE ${tableName} SET prediction_2_rev_p1_win = ${matchPred.p1Probability}, prediction_2_rev_match_no = ${matchPred.probabilityMatchNo} WHERE id = '${matchPred.id}'`

    console.log(sql)

    await connection.query(sql)
    await connection.end()
}

export const updateMatchRecordWinner = async (matchStatus: any, id: String, tableName: string) => {
    const winner = matchStatus !== null ? matchStatus.winner : 0
    const setScore = matchStatus !== null ? matchStatus.setScore : '0'
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `UPDATE ${tableName} SET winner = ${winner}, set_score = '${setScore}' WHERE id = '${id}'`
    await connection.query(sql)

    const sqlPattern = `UPDATE table_tennis_pattern SET winner = ${winner}, score = '${setScore}' WHERE id = '${id}'`
    await connection.query(sqlPattern)

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
    // and match_time > '2025-12-02 00:00:00' 
    // and match_time < '2025-12-02 23:23:59'`
    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getTTSafeMatches = async () => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `
select * from (

select 
	id
	, match_time
	, bet_on
	, notes
	
	, p1_name, p2_name

	, h2h_streak_win_rate
	, h2h_streak_match_count

    , prediction_raw_p1
	, prediction_raw_count

    , prediction_h2h_scores_rate
	, prediction_h2h_scores_count

	, prediction_streak_p1_win
	, prediction_streak_match_no
	
	, prediction_3
	, prediction_3_win_count
	, prediction_3_count
		
	, prediction_2_rev_p1_win
	, prediction_2_rev_p1_win_count
	, prediction_2_rev_match_no
		
	, streak_score
	, pLast_score
	, pwon_last_score

	, prediction_p1_win
	, prediction_p1_win_count
	, prediction_match_no
	
	, prediction_2_p1_win
	, prediction_2_p1_win_count
	, prediction_2_match_no
	
	, lost_won_rate
	, lost_won_p1_win_count
	, lost_won_count
		
	, p1_won_won, p2_won_won
	, p1_won_lost, p2_won_lost
	, p1_lost_won, p2_lost_won
	, p1_lost_lost, p2_lost_lost
	
	
	, p1_streak, p2_streak
	, h2h_p1, h2h_p2
	, bm_p1, bm_p2

    , l10_p1 - l10_p2 AS l10_gap
    , l30_p1 - l30_p2 AS l30_gap

	, p1_p1last, p1_p2last, p2_p1last, p2_p2last
	, p1_last_game_set_score, p2_last_game_set_score

from table_tennis_matches
where winner is null
)
where bet_on is not null
    and match_time > (now() AT TIME ZONE 'Australia/Sydney')

order by match_time desc`

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const setTTPredictions = async () => {
    const pool = new Pool({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    const client = await pool.connect();
    
 try {
        // Use client.query() to call the stored procedure
        const sql = 'CALL update_predictions();'
        await client.query(sql)

        // A stored procedure using `CALL` does not return a result set.
        // It returns command status. If `update_predictions()` has `OUT` parameters or
        // returns a set of rows, you would use a `SELECT` statement to get them.
        return 'getPredictionsTT completed'
    } finally {
        // Release the client back to the pool
        client.release();
    }
}


export const getTtFiveFiveRecords = async () => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `SELECT * FROM table_tennis_matches WHERE winner IS NULL
        and odd_p2 > odd_p1
    	and h2h_p1 = 5
        and h2h_p2 = 5`
    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getTtLessThanOneHalfRecords = async () => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `SELECT * FROM table_tennis_matches WHERE winner IS NULL
        and odd_p2 < odd_p1
    	and odd_p2 < 1.5`
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

export const getH2hPrevV1SimilarMatch = async (match: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `select * from ${tableName}
        where winner is not null
            and l10_p1 = ${match.l10_p1}
            and l10_p2 = ${match.l10_p2}
            and h2h_p1 = ${match.h2h_p1}
            and h2h_p2 = ${match.h2h_p2}`

    console.log(sql)

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getH2hScoreSimilarMatch = async (match: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `select * from ${tableName}
        where winner is not null
	        and p1_win_current_h2h = ${match.p1_win_current_h2h} 
            and p1_lost_current_h2h = ${match.p1_lost_current_h2h}
	        and p2_win_current_h2h = ${match.p2_win_current_h2h} 
            and p2_lost_current_h2h = ${match.p2_lost_current_h2h}`

    console.log(sql)

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getH2hStreakScoreSimilarMatch = async (match: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `select * from ${tableName}
        where winner is not null
	        and p1_win_current_h2h = ${match.p1_win_current_h2h} 
            and p1_lost_current_h2h = ${match.p1_lost_current_h2h}
	        and p2_win_current_h2h = ${match.p2_win_current_h2h} 
            and p2_lost_current_h2h = ${match.p2_lost_current_h2h}
            and p1_streak = '${match.p1_streak}'
            and p2_streak = '${match.p2_streak}'`

    console.log(sql)

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getH2hStreakSimilarMatch = async (match: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `select * from ${tableName}
        where winner is not null
	        and p1_streak = '${match.p1_streak}' 
            and p2_streak = '${match.p2_streak}'
	        and h2h_p1 = ${match.h2h_p1} 
            and h2h_p2 = ${match.h2h_p2}`

    console.log(sql)

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getL10ScoreSimilarMatch = async (match: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `select * from ${tableName}
        where winner is not null
	        and p1_win_current_l10 = ${match.p1_win_current_l10} 
            and p1_lost_current_l10 = ${match.p1_lost_current_l10}
	        and p2_win_current_l10 = ${match.p2_win_current_l10} 
            and p2_lost_current_l10 = ${match.p2_lost_current_l10}`

    console.log(sql)

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

// const operator = (p1: number, p2: number) => {
//     if (p1 > p2) {
//         return '>'
//     } else if (p1 < p2) {
//         return '<'
//     } else {
//         return '='
//     }
// }

export const getSimilarMatchAlt2 = async (match: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `SELECT * 
        FROM ${tableName}
        WHERE h2h_p1 = ${match.h2h_p1}
            AND h2h_p2 = ${match.h2h_p2}
            AND bm_p1 = ${match.bm_p1}
            AND bm_p2 = ${match.bm_p2}
            AND l10_p1 = ${match.l10_p1}
            AND l10_p2 = ${match.l10_p2}
	        AND winner is not null;`

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getSimilarL10 = async (match: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `SELECT * 
        FROM ${tableName}
        WHERE l10_p1 = ${match.l10_p1}
            AND l10_p2 = ${match.l10_p2}
            AND winner is not null;`

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getSimilarPrediction = async (predictionAlt2: any, l10Prediction: any, streakPrediction: any) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    if (predictionAlt2.p1Probability === '0' || l10Prediction.p1Probability === '0' || streakPrediction.p1Probability === '0') return []

    await connection.connect()
    const sql = `select *
        from table_tennis_matches
        where prediction_2_p1_win >= ${predictionAlt2.p1Probability - 0.05} and prediction_2_p1_win <= ${parseFloat(predictionAlt2.p1Probability) + 0.05}
	        and prediction_l10_p1_win >= ${l10Prediction.p1Probability - 0.05} and prediction_streak_p1_win <= ${parseFloat(l10Prediction.p1Probability) + 0.05}
	        and prediction_streak_p1_win >= ${streakPrediction.p1Probability - 0.05} and prediction_streak_p1_win <= ${parseFloat(streakPrediction.p1Probability) + 0.05}
	        and winner is not null;`

    console.log(sql)

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getSimilarStreak = async (match: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    await connection.connect()
    const sql = `SELECT *
        FROM ${tableName}
        WHERE p1_streak = '${match.p1_streak}'
            AND p2_streak = '${match.p2_streak}'
            AND winner is not null; `

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getSimilarMatchAlt2Rev = async (match: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    let diffParam = `h2h_p2 = ${match.h2h_p2} and h2h_p1 = ${match.h2h_p1} `

    if (tableName === 'tennis_matches') {
        diffParam = `l10_p2 = ${match.l10_p1} and l10_p1 = ${match.l10_p2} `
    }


    await connection.connect()
    const sql = `select * from ${tableName} 
    where ${diffParam}
        and p1_streak = '${match.p1_streak}' and p2_streak = '${match.p2_streak}'
	    and winner is not null`

    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}


export const getTtSimilarMatch = async (match: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    let sql = `select * from ${tableName}
        where h2h_p2 = ${match.h2h_p2} and h2h_p1 = ${match.h2h_p1}
            and bm_p2 = ${match.bm_p2} and bm_p1 = ${match.bm_p1}
            and l10_p2 = ${match.l10_p1} and l10_p1 = ${match.l10_p2}
            and p1_streak = '${match.p1_streak}' and p2_streak = '${match.p2_streak}'
            and winner is not null`

    await connection.connect()
    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getDistancesPrediction = async (closesMatch: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    let sql = `select *
        from ${tableName}
        where prediction_distance_winner = ${closesMatch[0].prediction} and prediction_distance = ${closesMatch[0].distance}
		    and prediction_distance_winner_2 = ${closesMatch[1].prediction} and prediction_distance_2 = ${closesMatch[1].distance}
		    and prediction_distance_winner_3 = ${closesMatch[2].prediction} and prediction_distance_2 = ${closesMatch[2].distance}
		    and winner is not null;`

    await connection.connect()
    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}

export const getDistancesScorePrediction = async (match: any, closesMatch: any, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    })

    const p1LastGameSetScore = match.p1_last_game_set_score.split('-')
    const p2LastGameSetScore = match.p2_last_game_set_score.split('-')

    let sql = `select *
        from ${tableName}
        where winner is not null 
	        and p1_last_game_won = ${match.p1_last_game_won} and (p1_last_game_set_score = '${match.p1_last_game_set_score}' or p1_last_game_set_score = '${p1LastGameSetScore[1]}-${p1LastGameSetScore[0]}')
            and p2_last_game_won = ${match.p2_last_game_won} and (p2_last_game_set_score = '${match.p2_last_game_set_score}' or p2_last_game_set_score = '${p2LastGameSetScore[1]}-${p2LastGameSetScore[0]}')
	        and prediction_distance_winner = ${closesMatch[0].prediction} 
            and prediction_distance_winner_2 = ${closesMatch[1].prediction} 
            and prediction_distance_winner_3 = ${closesMatch[2].prediction};
`

    await connection.connect()
    const result = await connection.query(sql)
    await connection.end()

    return result.rows
}
