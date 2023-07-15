// # 国家统计局
import ora from 'ora'
import { URL } from 'node:url'
import ProgressBar from 'progress'
import { yearSpider } from '../spiders/year.js'
import { provinceSpider } from '../spiders/province.js'
import { citySpider } from '../spiders/city.js'
import { countySpider } from '../spiders/county.js'
import { townSpider } from '../spiders/town.js'
import { villageSpider } from '../spiders/village.js'
import config from '../config.js'

const spiderPipes = [
  {
    name: '市级',
    spider: citySpider,
    afterTick(parentNode, data) {
      parentNode.code = data[0].code.slice(0, 2).padEnd(12, '0')
    },
  },
  {
    name: '区级',
    spider: countySpider,
  },
  {
    name: '镇级',
    spider: townSpider,
  },
  {
    name: '村级',
    spider: villageSpider,
  },
]

async function crawlPipe(parentNodeList, max, index = 0) {
  const pipe = spiderPipes[index]
  if (index > max - 2 || !pipe) {
    return parentNodeList
  }

  const bar = new ProgressBar('Progress [:bar] :percent', {
    total: parentNodeList.length,
  })

  const spinner = ora().info(
    `正在爬取${pipe.name}数据...（请求数：${parentNodeList.length}）`,
  )

  let allNodeList = []
  for (let parentNode of parentNodeList) {
    let nodeList = await pipe.spider(parentNode.url)
    allNodeList = [
      ...allNodeList,
      ...nodeList.map((item) => {
        return {
          ...item,
          url: new URL(item.url, parentNode.url).href,
        }
      }),
    ]
    pipe.afterTick?.(parentNode, nodeList)
    bar.tick()
  }
  spinner.succeed(`成功爬取${pipe.name}数据`)

  return [...parentNodeList, ...(await crawlPipe(allNodeList, max, ++index))]
}

export async function statsCrawling() {
  const level = config.level

  const spinner = ora().info('正在爬取年份数据...')
  const yearData = await yearSpider(config.statsZoningUrl)
  spinner.succeed('成功爬取年份数据')

  // 省
  const latestYear = yearData[0]
  const yearUrl = new URL(latestYear.url, url).href
  let provinceData = []
  if (level >= 1) {
    spinner.info('正在爬取省份数据...')
    provinceData = (await provinceSpider(yearUrl)).map((item) => {
      return {
        ...item,
        url: new URL(item.url, yearUrl).href,
      }
    })
    spinner.succeed('成功爬取省份数据')
  }

  return await crawlPipe(provinceData, config.level)
}

export default statsCrawling
