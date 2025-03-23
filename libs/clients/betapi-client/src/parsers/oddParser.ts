import _ from 'lodash'
import { Odds } from '../types/odds'

export default class OddParser {
    static parse(startOdd?: object,
    ): Odds {
        return {
            prematchOddP1: _.get(startOdd, 'home_od', 0),
            prematchOddP2: _.get(startOdd, 'away_od', 0),
        }
    }
}
