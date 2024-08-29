interface Node {
  name: string
  code: number
  children: Node[]
}

export function getRegionData(): Node[]

export function getProvinces(): {
  code: number
  name: string
}[]

export function getCities(): Node[]

export function getCounties(): Node[]

export const mapProvinces: Record<number, string>
export const mapCities: Record<number, string>
export const mapCounties: Record<number, string>
export const mapAllArea: Record<number, string>
