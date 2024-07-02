import { parse } from 'node-html-parser'
export default class ResultParser {

  static parse(html: string) : number {
    const root = parse(html);
    const matchColumns = root.getElementById('score')

    console.log('>>>matchColumns>>>', matchColumns)

    return 0
  }
}