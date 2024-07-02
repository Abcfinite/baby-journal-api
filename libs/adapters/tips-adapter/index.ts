import _ from "lodash"
import { parse } from 'node-html-parser';
import S3ClientCustom from '@abcfinite/s3-client-custom'
import BetapiClient from "../../clients/betapi-client";

export default class TipsAdapter {
  async getTips() {
    // const matchStatFile = await new S3ClientCustom().getFile('tennis-matchstat', 'matchstat.html')

    // const matchStatHtml = parse(matchStatFile)
    // const predictions = matchStatHtml.getElementsByTagName('div').filter(div => div.attributes.class === 'prediction-table-container')

    // console.log('>>>>>predictions>>>', predictions.length)

    // predictions.forEach(pred => {
    //   const pName = pred.querySelector('.player-name-pt');
    //   console.log('>>>>name>>>>', pName.text)

    //   const aOdds = pred.querySelector('a');
    //   console.log('>>>>odds>>>>', aOdds.text.replaceAll(/\s/g,''))

    //   const predPercentage = pred.querySelector('.prediction-item.item-border');
    //   console.log('>>>>odds>>>>', predPercentage.text.replaceAll(/\s/g,'').replaceAll(/\%/g,''))
    // })

    new BetapiClient().getEvents()

    return  'success'


  }
}