import { load } from 'cheerio'
import { CustomError } from '../CustomError.js'
import { request } from '../request.js'
import config from '../config.js'

export async function citySpider(url) {
  const res = await request(url, {
    retry: config.retry,
    timeout: config.timeout,
  })

  if (!res.ok) {
    throw CustomError(res, citySpider)
  }

  const html = await res.text()
  const $ = load(html)

  const data = $('.citytr')
    .toArray()
    .map((el) => {
      const anchors = $(el).find('a')
      return {
        code: anchors.eq(0).text().trim(),
        url: anchors.eq(0).attr('href'),
        name: anchors.eq(1).text().trim(),
      }
    })

  return data
}

citySpider.level = 2
citySpider.text = '市'

export default citySpider
