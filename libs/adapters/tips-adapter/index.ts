import _ from "lodash"
import { parse } from 'node-html-parser';
import S3ClientCustom from '@abcfinite/s3-client-custom'
import BetapiClient from "../../clients/betapi-client";
import { Prediction } from './src/types/prediction';

export default class TipsAdapter {
  async getTips() {
    const matchStatFile = await new S3ClientCustom().getFile('tennis-matchstat', 'matchstat.html')

    let predictionCols: Array<Prediction> = []
    const matchStatHtml = parse(matchStatFile)
    const predictions = matchStatHtml.getElementsByTagName('div').filter(div => div.attributes.class === 'ms-prediction-table')

    predictions.forEach(pred => {
      const pTime = pred.querySelector('.prediction-time');
      const pName = pred.querySelector('.player-name-pt');
      const aOdds = pred.querySelector('.odds-item.item-border');
      const predPercentage = pred.querySelector('.prediction-item.item-border');

      const prediction: Prediction = {
        date: pTime.text.replaceAll(/\s/g,'').split('/')[0],
        player1: pName.text.trim(),
        odds: ((Math.round(Number(aOdds.text.replaceAll(/\s/g,'')) * 100) / 100) - 1).toFixed(2),
        percentage: predPercentage.text.replaceAll(/\s/g,'').replaceAll(/\%/g,''),
      }

      if (!prediction.player1.includes('over')) {
        predictionCols.push(prediction)
      }
    })

    const events = await new BetapiClient().getEvents()

    let isP1 = true
    predictionCols = predictionCols.map(p => {
      let e = events.find(e => e.player1.split(' ')[0] === p.player1.split(' ')[0] )
      isP1 = true

      if (e === undefined || e === null) {
        e = events.find(e => e.player2.split(' ')[0] === p.player1.split(' ')[0] )
        isP1 = false
      }

      if (e !== undefined && e !== null) {
        p.player2 = isP1 ? e.player2 : e.player1
        p.date = new Date(Number(e.time) * 1000).toLocaleDateString()
        p.time = new Date(Number(e.time) * 1000).toLocaleString('en-US', {timeZone: 'Australia/Sydney'}).split(',')[1]
      }

      return p
    })

    return  predictionCols.map(p => {
      if (p.player2 != null) {
        return `${p.date},${p.time},${p.player1},${p.player2},${p.percentage},${p.odds}`
      }

      return `${p.date},00:00,${p.player1},${p.player2},${p.percentage},${p.odds}`
    }).join('\r\n')
    // return  [].map(p => `${p.time},${p.player1},${p.player2},${p.percentage},${p.odds}`).join('\r\n')
  }
}