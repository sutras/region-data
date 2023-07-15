// # 民政局
import ora from 'ora'
import { mcaSpider } from '../spiders/mca.js'
import config from '../config.js'

export async function mcaCrawling() {
  const spinner = ora().info('正在爬取数据...')
  const data = await mcaSpider(config.mcaZoningUrl)
  spinner.succeed('成功爬取数据')

  return data
}

export default mcaCrawling
