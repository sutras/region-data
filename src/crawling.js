import fs from 'node:fs'
import ora from 'ora'
import { mcaCrawling } from './channels/mca.js'
import { statsCrawling } from './channels/stats.js'
import config from './config.js'
import { CONST_TEMP_FILE } from './const.js'

const channels = {
  statsCrawling,
  mcaCrawling,
}

const normalizedPipe = [
  // 删除无关字段
  function flush([data, map]) {
    data = data.map((item) => {
      return {
        code: item.code,
        name: item.name,
      }
    })

    return [data, map]
  },

  // 填补直辖市，确保和省份级数相同
  function fillMunicipality([data, map]) {
    const willFilling = []

    data.forEach((item) => {
      if (/^\d{2}0{4}$/.test(item.code)) {
        const code = item.code.slice(0, 2).concat('0100').padEnd(12, '0')
        if (!map[code]) {
          willFilling.push({
            ...item,
            code,
          })
        }
      }
    })

    return [[...data, ...willFilling], map]
  },

  // 填补只有县级，没有市级的情况
  // https://www.mca.gov.cn/mzsj/xzqh/2022/202201xzqh.html
  // 419001 济源市
  function fillCityWithCounty([data, map]) {
    const willFilling = []

    data.forEach((item) => {
      const code = item.code.slice(0, 4).padEnd(12, '0')
      if (!map[code]) {
        willFilling.push({
          ...item,
          code,
        })
      }
    })

    return [[...data, ...willFilling], map]
  },

  // 将直辖市下面的“市辖区”改为对应直辖市名称
  function renameDistrict([data, map]) {
    data = data.map((item) => {
      let name = item.name
      if (name === '市辖区' && /^\d{4}(?=00)/.test(item.code)) {
        const node = data.find(
          (el) => el.code === item.code.slice(0, 2).padEnd(12, '0'),
        )
        if (node) {
          name = node.name
        }
      }
      return {
        ...item,
        name,
      }
    })

    return [data, map]
  },

  // 把区划代码转换为数字
  function toNumber([data, map]) {
    data = data.map((item) => {
      return {
        ...item,
        code: Number(item.code),
      }
    })

    return [data, map]
  },

  // 按照区划代码从小到大排序
  function sort([data, map]) {
    data = data.sort((a, b) => {
      return a.code - b.code
    })

    return [data, map]
  },

  // 只要data
  function last([data]) {
    return data
  },
]

function normalizeData(data) {
  return normalizedPipe.reduce((data, pipe) => pipe(data), data)
}

export async function crawling() {
  let data = []

  if (config.cache) {
    data = JSON.parse(fs.readFileSync(CONST_TEMP_FILE, 'utf-8'))
    ora().succeed('已读取本地缓存文件')
  } else {
    const channel = channels[config.channel]
    data = await channel()
    ora().succeed('已完成所有数据爬取')

    // 缓存数据
    fs.writeFile(CONST_TEMP_FILE, JSON.stringify(data), (err) => {
      if (err) {
        throw err
      }
    })
  }

  const map = {}
  data.forEach((item) => {
    map[item.code] = item
  })

  return normalizeData([data, map])
}
