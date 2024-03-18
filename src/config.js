const defaultConfig = {
  // 网络
  timeout: 10000,
  retry: 3,

  // 渠道
  channel: 'statsCrawling',
  statsZoningUrl: 'https://www.stats.gov.cn/sj/tjbz/qhdm/',
  year: 'latest',
  level: 3,
  mcaZoningUrl: 'https://www.mca.gov.cn/mzsj/xzqh/2022/202201xzqh.html',

  // 文件
  cache: false,
}

const config = {
  ...defaultConfig,
}

export const setConfig = (customConfig) => {
  Object.assign(config, customConfig)
}

export default config
