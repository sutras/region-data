- [说明](#说明)
- [安装](#安装)
- [使用](#使用)
- [API](#api)
  - [getProvinces()](#getprovinces)
  - [getCities()](#getcities)
  - [getCounties()](#getcounties)
  - [getRegionData()](#getregiondata)
- [业务流程](#业务流程)
- [目录结构](#目录结构)
- [数据来源](#数据来源)
- [特殊区划说明](#特殊区划说明)
- [配置](#配置)
  - [网络配置](#网络配置)
  - [数据配置](#数据配置)
- [国家统计局区划和城乡划分页面 html 源码规则](#国家统计局区划和城乡划分页面-html-源码规则)
  - [年份](#年份)
  - [省、自治区](#省自治区)
  - [市、自治州](#市自治州)
  - [区、县](#区县)
  - [镇、街道、乡](#镇街道乡)
  - [村委会、居委会、社区](#村委会居委会社区)
- [民政局行政区划代码页面 html 源码规则](#民政局行政区划代码页面-html-源码规则)
- [错误类型](#错误类型)
- [生成的文件类型和结构](#生成的文件类型和结构)
- [省市区区划代码库 region-data 的开发过程](#省市区区划代码库-region-data-的开发过程)

# 说明

中国行政区划数据（不包含港澳台），包含省市区三级数据。

区划代码省市区仅包含 6 位，镇则包含 9 位。

本库区划数据保证都有三级，可能是“省>市>区”、“省>市>镇”、“直辖市>直辖区>区”或者“直辖市>县>具体县”.

> **最新爬取时间：2024-03-18**

# 安装

```bash
npm install region-data --save
```

# 使用

```js
// ESM
import { getRegionData } from 'region-data'

// CommonJS
const { getRegionData } = require('region-data')

// 获取数据
const regionData = getRegionData()
```

# API

## getProvinces()

获取省份数据。

## getCities()

获取省份+城市数据。

## getCounties()

获取省份+城市+县数据。

## getRegionData()

同 getCounties()。

# 业务流程

```plaintext

开启进程 ──> 交互式配置 ──> 爬取数据/读取缓存 ──> 写入文件 ──> (结束)
                            │
                            v
                  ┌──> 爬取年份>省>市>区>镇>村
          重试3次  │         │
                  │         v
                  └───Y─<网络错误>─N──────>（结束）

```

# 目录结构

```plaintext

region-data
  ├─ dist  // 生成的区划数据目录，npm会发布此目录
  │   ├─ region.cjs  // CommonJS规范默认导入的文件
  │   └─ region.mjs  // ESM规范默认导入的文件
  │
  ├─ src  // 核心源码目录
  │   ├─ channels  // 渠道目录，主要有国家统计局和民政部，您可以选择不同的渠道爬取数据
  │   │     ├─ mca.js  // 民政局渠道
  │   │     └─ stats.js  // 国家统计局渠道
  │   │
  │   ├─ spiders  // 爬虫目录，各渠道的爬虫程序都在这个目录
  │   │     ├─ city.js  // 市级爬虫程序
  │   │     ├─ county.js  // 县级爬虫程序
  │   │     ├─ mca.js  // 民政部爬虫程序
  │   │     ├─ province.js  // 省级爬虫程序
  │   │     ├─ town.js  // 镇级爬虫程序
  │   │     ├─ village.js  // 乡级爬虫程序
  │   │     └─ year.js  // 年份爬虫程序
  │   │
  │   ├─ templates  // 模板文件
  │   │     └─ region.ejs  // region.cjs和region.mjs文件的模板，用来填充省市区数据以及区分不同模块的导出
  │   │
  │   ├─ config.js  // 全局的通用配置文件
  │   ├─ configure.js  // 命令行交互配置
  │   ├─ const.js  // 常量文件
  │   ├─ crawling.js  // 爬虫主文件和入口文件，负责调用不同的渠道爬取数据、缓存数据、格式化数据
  │   ├─ CustomError.js  // 自定义错误对象
  │   ├─ log.js  // 处理错误信息的打印
  │   ├─ request.js  // 对fetch的简单封装，为其添加超时中断以及重试功能
  │   ├─ start.js  // node进程主要调用的文件，控制整个进程的生命周期流程
  │   └─ writeFile.js  // 将爬取到的数据写入文件，可以写成多种格式的json文件和js文件
  │
  ├─ temp  // 爬取的原始数据，生成文件时可以复用这些数据，避免重复发起请求
  │   └─ region.json  // 国际统计局省市区三级数据，包括名称、编码和页面URL
  │
  └─ index.js  // node进程入口文件，里面主要调用start.js运行程序

```

# 数据来源

- [国家统计局](http://www.stats.gov.cn/sj/tjbz/qhdm/)
- [民政部](https://www.mca.gov.cn/mzsj/xzqh/2022/202201xzqh.html)

# 特殊区划说明

- 直辖市和省一个级别，其本身又是一个市，国家统计局展示的其下一级名称为“市辖区”，转换时需将“市辖区”转换为直辖市的名称。
- 另外，重庆市下面除了有“市辖区”，还有一个“县”，就不进行转换了，让“县”作为二级。
- “东莞市、中山市、儋州市、嘉峪关市”下面没有区，直接就到镇，需将镇转换为三级，往下依次上推。
- 而“嘉峪关市”又很特殊，国家统计局网站中此市下面是“市辖区”，获取数据时还需要往下一级。
- 在国家统计局网站中，“雄安新区”是没有下一级的，而实际上，“容城县”、“安新县”、“雄县”都已归“雄安新区”管理，即使从区划代码上看是属于“保定市”；因此本库中暂不包含“雄安新区”，“容城县”、“安新县”、“雄县”仍归于“保定市”下面。

# 配置

## 网络配置

- 超时时间（10000）
- 重试次数（3）

## 数据配置

- 数据来源（国家统计局、民政局）
- 年份（最新年份、具体年份）
- 区划级别（省、市、区、镇、村委会）

# 国家统计局区划和城乡划分页面 html 源码规则

## 年份

- **页面链接**：`http://www.stats.gov.cn/sj/tjbz/qhdm/`
- **年份、url**：

  ```js
  // 浏览器控制台
  $$('.list-content li a:first-child').map((anchor) => {
    return {
      name: anchor.textContent.trim(),
      url: anchor.href,
    }
  })

  // 服务器 cheerio
  $('.list-content li a:first-child')
    .toArray()
    .map((anchor) => {
      return {
        name: $(anchor).text().trim(),
        url: $(anchor).attr('href'),
      }
    })
  ```

## 省、自治区

- **页面链接**：`new URL(<年份url>, <年份页面url>).href`
- **区划代码、名称、url**：

  ```js
  // 浏览器控制台
  $$('.provincetr a').map((anchor) => ({
    code: '',
    name: anchor.textContent.trim(),
    url: anchor.href,
  }))

  // 服务器 cheerio
  $('.provincetr a')
    .toArray()
    .map((anchor) => ({
      code: '',
      name: $(anchor).text().trim(),
      url: $(anchor).attr('href'),
    }))
  ```

## 市、自治州

- **页面链接**：`new URL(<省url>, <年份url>).href`
- **区划代码、名称、url**：

  ```js
  // 浏览器控制台
  $$('.citytr').map((el) => {
    const anchors = el.querySelectorAll('a')
    return {
      code: anchors[0].textContent.trim(),
      url: anchors[0].href,
      name: anchors[1].textContent.trim(),
    }
  })

  // 服务器 cheerio
  $('.citytr')
    .toArray()
    .map((el) => {
      const anchors = $(el).find('a')
      return {
        code: anchors.eq(0).text().trim(),
        url: anchors.eq(0).attr('href'),
        name: anchors.eq(1).text().trim(),
      }
    })
  ```

## 区、县

- **页面链接**：`new URL(<市url>, <省url>).href`
- **区划代码、名称、url**：

  ```js
  // 浏览器控制台
  $$('.countytr, .towntr')
    .map((el) => {
      const anchors = el.querySelectorAll('a')
      // 市辖区
      if (anchors.length === 0) {
        return false
      }
      return {
        code: anchors[0].textContent.trim(),
        name: anchors[1].textContent.trim(),
        url: anchors[1].href,
      }
    })
    .filter(Boolean)

  // 服务器 cheerio
  $('.countytr, .towntr')
    .toArray()
    .map((el) => {
      const anchors = $(el).find('a')
      // 市辖区
      if (anchors.length === 0) {
        return false
      }
      return {
        code: anchors.eq(0).text().trim(),
        name: anchors.eq(1).text().trim(),
        url: anchors.eq(1).attr('href'),
      }
    })
    .filter(Boolean)
  ```

## 镇、街道、乡

- **页面链接**：`new URL(<区url>, <市url>).href`
- **区划代码、名称、url**：

  ```js
  // 浏览器控制台
  $$('.towntr, .villagetr').map((el) => {
    const anchors = el.querySelectorAll('a')

    if (anchors.length !== 0) {
      return {
        code: anchors[0].textContent.trim(),
        name: anchors[1].textContent.trim(),
        url: anchors[1].href,
      }
    }

    const td = el.querySelectorAll('td')
    return {
      code: td[0].textContent.trim(),
      name: td[2].textContent.trim(),
    }
  })

  // 服务器 cheerio
  $('.towntr, .villagetr')
    .toArray()
    .map((el) => {
      const anchors = $(el).find('a')
      if (anchors.length !== 0) {
        return {
          code: anchors.eq(0).text().trim(),
          name: anchors.eq(1).text().trim(),
          url: anchors.eq(1).attr('href'),
        }
      }

      const td = $(el).find('td')
      return {
        code: td.eq(0).text().trim(),
        name: td.eq(2).text().trim(),
      }
    })
  ```

## 村委会、居委会、社区

- **页面链接**：`new URL(<镇url>, <区url>).href`
- **区划代码、名称、url**：

  ```js
  // 浏览器控制台
  $$('.villagetr').map((el) => {
    const td = el.querySelectorAll('td')
    return {
      code: td[0].textContent.trim(),
      name: td[2].textContent.trim(),
    }
  })

  // 服务器 cheerio
  $('.villagetr')
    .toArray()
    .map((el) => {
      const td = $(el).find('td')
      return {
        code: td.eq(0).text().trim(),
        name: td.eq(2).text().trim(),
      }
    })
  ```

# 民政局行政区划代码页面 html 源码规则

- **页面链接**：`https://www.mca.gov.cn/mzsj/xzqh/2022/202201xzqh.html`
- **区划代码、名称**：

  ```js
  // 浏览器控制台
  $$('table tr')
    .map((el) => {
      const td = el.querySelectorAll('td')
      return {
        code: td[1]?.textContent.trim() || '',
        name: td[2]?.textContent.trim() || '',
      }
    })
    .filter((item) => /^\d{6}$/.test(item.code))

  // 服务器 cheerio
  $('table tr')
    .toArray()
    .map((el) => {
      const td = $(el).find('td')
      return {
        code: td.eq(1).text().trim() || '',
        name: td.eq(2).text().trim() || '',
      }
    })
    .filter((item) => /^\d{6}$/.test(item.code))
  ```

# 错误类型

- 请求终止 (AbortError)
- fetch 配置问题 (TypeError)
- 网络问题 (TypeError)
- 非 200 响应 (自定义错误事件)
- 请求超时 (自定义错误事件)
- 爬取的网站结构变化 (自定义错误事件)

# 生成的文件类型和结构

- `nested.json`：省市区嵌套的多层结构。

  ```json
  [
    {
      "name": "北京市",
      "code": 110000,
      "children": [
        {
          "name": "北京市",
          "code": 110100,
          "children": [
            {
              "name": "东城区",
              "code": 110101
            }
          ]
        }
      ]
    }
  ]
  ```

- `nested-abbr.json`：结构与`nested.json`相同，但是将对象的键名缩写为一个字符，`i`指`items`。

  ```json
  [
    {
      "n": "北京市",
      "c": 110000,
      "i": [
        {
          "n": "北京市",
          "c": 110100,
          "i": [
            {
              "n": "东城区",
              "i": 110101
            }
          ]
        }
      ]
    }
  ]
  ```

- `flat.json`：省市区平铺的一层结构。

  ```json
  [
    {
      "name": "北京市",
      "code": 110000
    },
    {
      "name": "北京市",
      "code": 110100
    },
    {
      "name": "东城区",
      "code": 110101
    }
  ]
  ```

- `flat-abbr.json`：结构同`flat.json`，但是将对象的键名缩写为一个字符。

  ```json
  [
    {
      "n": "北京市",
      "c": 110000
    },
    {
      "n": "北京市",
      "c": 110100
    },
    {
      "n": "东城区",
      "c": 110101
    }
  ]
  ```

- `map.json`：区划代码作为键，名称作为值的对象结构。

  ```json
  {
    "110000": "北京市",
    "110100": "北京市",
    "110101": "东城区"
  }
  ```

- `hierarchic.json`：省市区分别处于不同的对象中。

  ```json
  {
    "provinces": {
      "110000": "北京市",
      "120000": "天津市",
      "130000": "河北省"
    },
    "cities": {
      "110100": "北京市",
      "120100": "天津市",
      "130100": "石家庄市"
    },
    "counties": {
      "110101": "东城区",
      "110102": "西城区",
      "110105": "朝阳区"
    }
  }
  ```

- `region.js`：原始的数据结构同`hierarchic.json`，其内部提供`getRegionData`函数会将数据转换为`nested.json`的结构；这是一种用时间换空间的做法，函数内部缓存了转换后的数据。

  ```js
  // ESM
  import { getRegionData } from 'region-data'

  // CommonJS
  const { getRegionData } = require('region-data')

  // 获取数据
  const regionData = getRegionData()
  ```

# 省市区区划代码库 region-data 的开发过程

[省市区区划代码库 region-data 的开发过程](https://zhuanlan.zhihu.com/p/643942463)
