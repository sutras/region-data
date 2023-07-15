import { load } from 'cheerio'
import { CustomError } from '../CustomError.js'
import { request } from '../request.js'
import config from '../config.js'

export async function provinceSpider(url) {
  const res = await request(url, {
    retry: config.retry,
    timeout: config.timeout,
  })

  if (!res.ok) {
    throw CustomError(res, provinceSpider)
  }

  const html = await res.text()
  const $ = load(html)

  const data = $('.provincetr a')
    .toArray()
    .map((anchor) => ({
      code: '',
      name: $(anchor).text().trim(),
      url: $(anchor).attr('href'),
    }))

  return data
}

provinceSpider.level = 1
provinceSpider.text = '省份'

export default provinceSpider
