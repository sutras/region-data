import { configure } from './configure.js'
import { crawling } from './crawling.js'
import { logError } from './log.js'
import { writeFile } from './writeFile.js'

export async function start() {
  try {
    await configure()
    const data = await crawling()
    await writeFile(data)
  } catch (err) {
    logError(err)
  }
}
