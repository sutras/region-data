interface Node {
  name: string
  code: number
  children: Node[]
}

export function getRegionData(): Node[]
