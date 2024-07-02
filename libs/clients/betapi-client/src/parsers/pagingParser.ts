import _ from 'lodash'
import { Paging } from '../types/paging'

export default class PagingParser {
  static parse(pager?: object,
  ): Paging {
    return {
        page: _.get(pager, 'page', 0),
        perPage: _.get(pager, 'per_page', 0),
        total: _.get(pager, 'total', 0),
    }
  }
}