import fs from 'node:fs'
import inquirer from 'inquirer'
import ora from 'ora'
import { setConfig } from './config.js'
import { CONST_TEMP_FILE } from './const.js'

export async function configure() {
  const spinner = ora()

  let cacheAnswers = null
  if (fs.existsSync(CONST_TEMP_FILE)) {
    cacheAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'cache',
        message: '是否直接读取缓存文件？',
        default: true,
      },
    ])
  }

  let answers = null
  if (!cacheAnswers || !cacheAnswers.cache) {
    answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'timeout',
        message: '超时时间（单位毫秒）',
        default: 10000,
        validate(value) {
          value = Number(value)
          if (isNaN(value) || value < 3000) {
            return '请设置大于3000毫秒的时间'
          }
          return true
        },
      },
      {
        type: 'input',
        name: 'retry',
        message: '重试次数',
        default: 3,
        validate(value) {
          value = Number(value)
          if (!Number.isInteger(value) || value < 0) {
            return '请输入大于等于0的整数'
          }
          return true
        },
      },

      // tips: 民政部数据不完整，仅从国家统计局获取
      // {
      //   type: 'list',
      //   name: 'channel',
      //   message: '请选择数据来源',
      //   choices: [
      //     {
      //       name: '国家统计局',
      //       value: 'statsCrawling',
      //     },
      //     {
      //       name: '民政部',
      //       value: 'mcaCrawling',
      //     },
      //   ],
      //   default: 'mcaCrawling',
      // },
      {
        type: 'confirm',
        name: 'startNow',
        message: '是否现在开始爬取数据？',
        default: true,
      },
    ])

    if (!answers.startNow) {
      process.exit(0)
    }

    answers.timeout = Number(answers.timeout)
    answers.retry = Number(answers.retry)
  }

  let statsAnswers = null
  // tips: 获取到镇级别的数据量太大了，没有必要
  // if (answers.channel === 'statsCrawling') {
  //   statsAnswers = await inquirer.prompt([
  //     {
  //       type: 'list',
  //       name: 'level',
  //       message: '请选择要获取到哪一级的数据',
  //       choices: [
  //         {
  //           name: '市',
  //           value: 2,
  //         },
  //         {
  //           name: '区、县',
  //           value: 3,
  //         },
  //         {
  //           name: '镇、街道、乡',
  //           value: 4,
  //         },
  //         {
  //           name: '村委会、居委会、社区',
  //           value: 5,
  //         },
  //       ],
  //       default: 1,
  //     },
  //   ])
  // }

  let finalAnswers = {
    ...cacheAnswers,
    ...answers,
    ...statsAnswers,
  }

  setConfig(finalAnswers)

  spinner.succeed('已完成配置')
}
