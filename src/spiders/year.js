import { load } from 'cheerio'
import { CustomError } from '../CustomError.js'
import { request } from '../request.js'
import config from '../config.js'

export async function yearSpider(url) {
  const res = await request(url, {
    retry: config.retry,
    timeout: config.timeout,
  })

  if (!res.ok) {
    throw CustomError(res, yearSpider)
  }

  const html = await res.text()
  const $ = load(html)

  const data = $('.list-content li a:first-child')
    .toArray()
    .map((anchor) => {
      return {
        name: $(anchor).text().trim(),
        url: $(anchor).attr('href'),
      }
    })

  return data
}

yearSpider.level = 0
yearSpider.text = '年份'

export default yearSpider
