import { load } from 'cheerio'
import { CustomError } from '../CustomError.js'
import { request } from '../request.js'
import config from '../config.js'

export async function villageSpider(url) {
  const res = await request(url, {
    retry: config.retry,
    timeout: config.timeout,
  })

  if (!res.ok) {
    throw CustomError(res, villageSpider)
  }

  const html = await res.text()
  const $ = load(html)

  const data = $('.villagetr')
    .toArray()
    .map((el) => {
      const td = $(el).find('td')
      return {
        code: td.eq(0).text().trim(),
        classify: td.eq(1).text().trim(),
        name: td.eq(2).text().trim(),
      }
    })

  return data
}

villageSpider.level = 5
villageSpider.text = '村委会'

export default villageSpider
