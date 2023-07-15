import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

export const CONST_CWD = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const CONST_DIST_PATH = resolve(CONST_CWD, 'dist')
export const CONST_TEMP_FILE = resolve(CONST_CWD, 'temp/region.json')
export const CONST_REGION_TEMPLATE_FILE = resolve(
  CONST_CWD,
  'src/templates/region.ejs',
)
