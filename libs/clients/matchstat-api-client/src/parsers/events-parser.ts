import { HttpResponse } from "@abcfinite/http-api-client/src/types/http-response";
import EventParser from "./event-parser";

export default class EventsParser {
    constructor() {}

    parse = (results : Array<Array<object>>) => {
        const cols = results.map(r =>  new EventParser().parse(r))
        return cols.flat()
    }
}