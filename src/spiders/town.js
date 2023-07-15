import { load } from 'cheerio'
import { CustomError } from '../CustomError.js'
import { request } from '../request.js'
import config from '../config.js'

export async function townSpider(url) {
  const res = await request(url, {
    retry: config.retry,
    timeout: config.timeout,
  })

  if (!res.ok) {
    throw CustomError(res, townSpider)
  }

  const html = await res.text()
  const $ = load(html)

  const data = $('.towntr, .villagetr')
    .toArray()
    .map((el) => {
      const anchors = $(el).find('a')
      return {
        code: anchors.eq(0).text().trim(),
        name: anchors.eq(1).text().trim(),
        url: anchors.eq(1).attr('href'),
      }
    })

  return data
}

townSpider.level = 4
townSpider.text = '乡镇'

export default townSpider
