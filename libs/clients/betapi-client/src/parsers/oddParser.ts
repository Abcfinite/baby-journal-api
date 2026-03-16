import _ from 'lodash'
import { Odds } from '../types/odds'

export default class OddParser {
    static parse(startOdd?: object, endOdd?: object
    ): Odds {
        return {
            prematchOddP1: _.get(startOdd, 'home_od', 0),
            prematchOddP2: _.get(startOdd, 'away_od', 0),
            prematchOddP1_2: _.get(endOdd, 'home_od', 0),
            prematchOddP2_2: _.get(endOdd, 'away_od', 0),
        }
    }
}
