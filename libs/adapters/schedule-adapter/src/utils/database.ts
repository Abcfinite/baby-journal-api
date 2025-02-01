import { Client } from 'pg'

export const insertMatchRecords = async (matches: Array<any>, tableName: string) => {
    const connection = new Client({
        connectionString: 'postgres://postgres:AWqasde321!@database-1.cs5ztqximrwk.ap-southeast-2.rds.amazonaws.com/tennis',
        ssl: {
            rejectUnauthorized: false
        }
    });

    await connection.connect()

    for (const match of matches) {
        try {
            const unixTime = Date.parse(`${match['date']} ${match['time']}`)
            const timestamp = new Date(unixTime)
            const localTimestamp = timestamp.toLocaleDateString('en-ZA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit' })
            const sql = `INSERT INTO ${tableName} (id, match_time, p1_id, p2_id, p1_name, p2_name, h2h_p1, h2h_p2, bm_p1, bm_p2, l10_p1, l10_p2)
                VALUES ('${match['id']}', '${localTimestamp}', '${match['p1Id']}', '${match['p2Id']}', '${match['p1Name']}', '${match['p2Name']}', 
                ${match['h2hP1']}, ${match['h2hP2']}, ${match['bmP1']}, ${match['bmP2']}, ${match['p1L10']}, ${match['p2L10']})`
            console.log('>>>sql : ', sql)
            await connection.query(sql)
        } catch (error) {
            console.error('error cannot insert', error);
        }
    }

    await connection.end()
}
