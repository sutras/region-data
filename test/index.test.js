const {
  getProvinces,
  getCities,
  getCounties,
  getRegionData,
  mapProvinces,
  mapCities,
  mapCounties,
  mapAllArea,
} = require('../dist/cjs/index.js')

const provices = getProvinces()
const cities = getCities()
const counties = getCounties()

test('getCounties === getRegionData', () => {
  expect(getCounties === getRegionData).toBe(true)
})

function checkNoChildrenNode(node) {
  if (
    Object.keys(node).sort().join(',') === 'code,name' &&
    typeof node.code === 'number' &&
    typeof node.name === 'string'
  ) {
    return true
  }
  return false
}

function checkHasChildrenNode(node) {
  if (
    Object.keys(node).sort().join(',') === 'children,code,name' &&
    typeof node.code === 'number' &&
    typeof node.name === 'string' &&
    Array.isArray(node.children) &&
    node.children.length > 0
  ) {
    return true
  }
  return false
}

test('provices data structure', () => {
  for (let proviceNode of provices) {
    if (!checkNoChildrenNode(proviceNode)) {
      console.log(proviceNode)
      throw new Error('数据结构不正确')
    }
  }
})

test('cities data structure', () => {
  for (let proviceNode of cities) {
    if (!checkHasChildrenNode(proviceNode)) {
      console.log(proviceNode)
      throw new Error('数据结构不正确')
    }
    for (let cityNode of proviceNode.children) {
      if (!checkNoChildrenNode(cityNode)) {
        console.log(cityNode)
        throw new Error('数据结构不正确')
      }
    }
  }
})

test('counties data structure', () => {
  for (let proviceNode of counties) {
    if (!checkHasChildrenNode(proviceNode)) {
      console.log(proviceNode)
      throw new Error('数据结构不正确')
    }
    for (let cityNode of proviceNode.children) {
      if (!checkHasChildrenNode(cityNode)) {
        console.log(cityNode)
        throw new Error('数据结构不正确')
      }
      for (let countyNode of cityNode.children) {
        if (!checkNoChildrenNode(countyNode)) {
          console.log(countyNode)
          throw new Error('数据结构不正确')
        }
      }
    }
  }
})

function checkMap(map) {
  for (let code of Object.keys(map)) {
    if (typeof map[code] !== 'string') {
      return false
    }
  }
  return true
}

test('map', () => {
  if (!checkMap(mapProvinces)) {
    throw new Error('数据结构不正确')
  }
  if (!checkMap(mapCities)) {
    throw new Error('数据结构不正确')
  }
  if (!checkMap(mapCounties)) {
    throw new Error('数据结构不正确')
  }
  if (!checkMap(mapAllArea)) {
    throw new Error('数据结构不正确')
  }
  if (
    Object.keys(mapProvinces).length +
      Object.keys(mapCities).length +
      Object.keys(mapCounties).length !==
    Object.keys(mapAllArea).length
  ) {
    throw new Error('数据结构不正确')
  }
})
