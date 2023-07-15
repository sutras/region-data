import fs from 'node:fs'
import fse from 'fs-extra'
import path from 'node:path'
import ora from 'ora'
import { CONST_DIST_PATH, CONST_REGION_TEMPLATE_FILE } from './const.js'

function write(fileName, data) {
  return new Promise((resolve, reject) => {
    fse.outputFile(
      path.resolve(CONST_DIST_PATH, fileName),
      JSON.stringify(data),
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      },
    )
  })
}

function isProvince(code) {
  return /^\d{2}0+$/.test(code)
}

function isCity(code) {
  return /^\d{2}(?!00)\d{2}0+$/.test(code)
}

function stringifyWithoutKeyQuote(obj) {
  return JSON.stringify(obj, null, 2).replace(/"([^"]+)":/g, '$1:')
}

function arrayToNested(data, { codeKey, nameKey, childrenKey }) {
  const map = {}
  data.forEach((item) => {
    map[item.code] = {
      [codeKey]: item.code,
      [nameKey]: item.name,
    }
  })

  const writeData = []

  data.forEach((item) => {
    const code = item.code
    const node = map[code]

    if (isProvince(code)) {
      writeData.push(node)
      return
    }

    const parentCode = code
      .toString()
      .slice(0, isCity(code) ? 2 : 4)
      .padEnd(6, '0')

    const parentNode = map[parentCode]

    if (parentNode) {
      if (!parentNode[childrenKey]) {
        parentNode[childrenKey] = []
      }
      parentNode[childrenKey].push(node)
    }
  })

  return writeData
}

function arrayToHierarchic(data) {
  const map = {
    provinces: {},
    cities: {},
    counties: {},
  }

  data.forEach((item) => {
    let level = ''

    if (isProvince(item.code)) {
      level = 'provinces'
    } else if (isCity(item.code)) {
      level = 'cities'
    } else {
      level = 'counties'
    }

    map[level][item.code] = item.name
  })
  return map
}

const strategies = [
  {
    name: 'nested.json',
    valid: false,
    write(data) {
      data = arrayToNested(data, {
        codeKey: 'code',
        nameKey: 'name',
        childrenKey: 'children',
      })

      return write('nested.json', data)
    },
  },

  {
    name: 'nested-abbr.json',
    valid: false,
    write(data) {
      data = arrayToNested(data, {
        codeKey: 'c',
        nameKey: 'n',
        childrenKey: 'i',
      })

      return write('nested-abbr.json', data)
    },
  },

  {
    name: 'flat.json',
    valid: false,
    write(data) {
      data = data.map((item) => {
        return {
          name: item.name,
          code: item.code,
        }
      })
      return write('flat.json', data)
    },
  },

  {
    name: 'flat-abbr.json',
    valid: false,
    write(data) {
      data = data.map((item) => {
        return {
          n: item.name,
          c: item.code,
        }
      })
      return write('flat-abbr.json', data)
    },
  },

  {
    name: 'map.json',
    valid: false,
    write(data) {
      const map = {}
      data.forEach((item) => {
        map[item.code] = item.name
      })
      return write('map.json', map)
    },
  },

  {
    name: 'hierarchic.json',
    valid: false,
    write(data) {
      const map = arrayToHierarchic(data)
      return write('hierarchic.json', map)
    },
  },

  {
    name: 'region.js',
    valid: true,
    async write(data) {
      const map = arrayToHierarchic(data)

      const suffixes = ['mjs', 'cjs']
      for (let suffix of suffixes) {
        let template = fs.readFileSync(
          `${CONST_REGION_TEMPLATE_FILE}.${suffix}`,
          'utf-8',
        )
        const output = template
          .replace(
            /(?<=const provinces = )\{.*?\}/,
            stringifyWithoutKeyQuote(map.provinces),
          )
          .replace(
            /(?<=const cities = )\{.*?\}/,
            stringifyWithoutKeyQuote(map.cities),
          )
          .replace(
            /(?<=const counties = )\{.*?\}/,
            stringifyWithoutKeyQuote(map.counties),
          )

        await write(`region.${suffix}`, output)
      }
    },
  },
]

export async function writeFile(data) {
  // 把区级及以上的区划代码转换为6位数字,镇级转换为9位数字
  data = data.map((item) => {
    let code = item.code.toString()
    if (/0{6}$/.test(code)) {
      code = code.slice(0, 6)
    } else if (/0{3}$/.test(code)) {
      code = code.slice(0, 9)
    }
    return {
      ...item,
      code: Number(code),
    }
  })

  const spinner = ora()
  for (let strategy of strategies) {
    if (strategy.valid) {
      spinner.info(`正在生成 ${strategy.name} ...`)
      await strategy.write(data)
      spinner.succeed(`已生成 ${strategy.name}`)
    }
  }
  spinner.succeed('已生成所有文件')
}
