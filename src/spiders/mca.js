import { load } from 'cheerio'
import { CustomError } from '../CustomError.js'
import { request } from '../request.js'
import config from '../config.js'

export async function mcaSpider(url) {
  const res = await request(url, {
    retry: config.retry,
    timeout: config.timeout,
  })

  if (!res.ok) {
    throw CustomError(res, mcaSpider)
  }

  const html = await res.text()
  const $ = load(html)

  const data = $('table tr')
    .toArray()
    .map((el) => {
      const td = $(el).find('td')
      return {
        code: td.eq(1).text().trim() || '',
        name: td.eq(2).text().trim() || '',
      }
    })
    .filter((item) => /^\d{6}$/.test(item.code))

  return data
}

mcaSpider.level = -1
mcaSpider.text = '民政局'

export default mcaSpider
