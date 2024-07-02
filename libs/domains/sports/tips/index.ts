import TipsAdapter from '@abcfinite/tips-adapter';
import { Handler } from 'aws-lambda';

export const getLatestTips: Handler = async (event: any) => {

  const result = await new TipsAdapter().getTips()

  const response = {
      statusCode: 200,
      body: JSON.stringify(result,
        null,
        2
      ),
    }

  return new Promise((resolve) => {
    resolve(response)
  })
}

