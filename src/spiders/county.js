import { load } from 'cheerio'
import { CustomError } from '../CustomError.js'
import { request } from '../request.js'
import config from '../config.js'
import { townSpider } from './town.js'

export async function countySpider(url) {
  const res = await request(url, {
    retry: config.retry,
    timeout: config.timeout,
  })

  if (!res.ok) {
    throw CustomError(res, countySpider)
  }

  const html = await res.text()
  const $ = load(html)

  let townDataPromise = null

  const data = $('.countytr, .towntr')
    .toArray()
    .map((el) => {
      const anchors = $(el).find('a')
      // 市辖区
      if (anchors.length === 0) {
        return false
      }

      const name = anchors.eq(1).text().trim()
      const countyUrl = anchors.eq(1).attr('href')

      // 没有区，需往下获取镇数据
      if (name === '市辖区' && config.level === 3) {
        townDataPromise = townSpider(new URL(countyUrl, url).href)
      }

      return {
        code: anchors.eq(0).text().trim(),
        name,
        url: countyUrl,
      }
    })
    .filter(Boolean)

  if (townDataPromise) {
    return await townDataPromise
  }

  return data
}

countySpider.level = 3
countySpider.text = '区县'

export default countySpider
