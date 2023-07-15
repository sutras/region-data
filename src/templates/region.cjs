const provinces = {}
const cities = {}
const counties = {}

let regions = null

function getRegionData() {
  if (!regions) {
    const map = {}
    const data = Object.keys(provinces).map((code) => {
      const node = {
        code,
        name: provinces[code],
      }
      return (map[code] = node)
    })

    function findFather(list, sliceEnd) {
      Object.keys(list).forEach((code) => {
        const node = {
          code,
          name: list[code],
        }
        map[code] = node

        const parentCode = code.slice(0, sliceEnd).padEnd(12, '0')
        const parentNode = map[parentCode]
        if (parentNode) {
          const children = parentNode.children
          if (!children) {
            children = parentNode.children = []
          }
          children.push(node)
        }
      })
    }

    findFather(cities, 2)
    findFather(counties, 4)

    regions = data
  }

  return regions
}

exports = {
  getRegionData,
}
