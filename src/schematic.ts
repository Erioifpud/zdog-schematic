import { decode, Tag } from "nbt-ts"
import { unzip } from 'gzip-js'
import { ObjectFromEntries } from './polyfill'
import color from '../data/color.json'

interface BlockState {
  [key: string]: string | number | boolean
}

interface BlockInfo {
  namespace: string
  type: string
  state: BlockState,
  color: string
}

interface BlockWithPos {
  block: BlockInfo
  x: number
  y: number
  z: number
}

function parseNbt(nbt: string, base64: boolean) {
  let buff
  if (base64) {
    buff = Buffer.from(nbt, 'base64')    
  } else {
    buff = require('fs').readFileSync(nbt)
  }
  
  const deflated = Buffer.from(unzip(buff))
  // const deflated = Buffer.from(buff)
  const data = decode(deflated, {
      unnamed: false,
      useMaps: true
  })
  return { [data.name]: [data.value] }
}

class Schematic {

}

export class SchematicV2 {
  parseBlock (options): BlockWithPos {
    const { value, index, width, length, palettes } = options
    const y = Math.floor(index / (width * length))
    const z = Math.floor((index % (width * length)) / width)
    const x = (index % (width * length)) % width
    const block = palettes.get(value)
    return {
      block,
      x,
      y,
      z
    }
  }

  initPalettes (schematic: Tag): Map<number, BlockInfo> {
    const palettes = new Map<number, BlockInfo>()
    for (let [key, value] of schematic.get('Palette').entries()) {
      let namespace = 'minecraft'
      let name = 'air'
      let state
      const length = key.length
      const namespaceSign = ':'
      const namespaceIndex = key.indexOf(namespaceSign)
      if (namespaceIndex !== -1) {
        namespace = key.substring(0, namespaceIndex)
        key = key.substring(namespaceIndex + 1)
      }
  
      const stateStartSign = '['
      const stateStartIndex = key.indexOf(stateStartSign)
      if (stateStartIndex !== -1) {
        // name = key.substring(0, stateStartIndex)
        const stateStr = key.substring(stateStartIndex + 1, length - 1)
        const pairList = stateStr.split(',')
        state = ObjectFromEntries(pairList.map(item => item.split('=')))
        key = key.substring(0, stateStartIndex)
      }
      name = key
      palettes.set(value.value, {
        namespace,
        type: name,
        state,
        color: color[name] || '#E62'
      })
    }
    return palettes
  }

  getBlocks (fileContent: string, ignoreAir: boolean = true): Array<BlockWithPos> {
    const schematic = parseNbt(fileContent, true)['Schematic'][0]
    const palettes = this.initPalettes(schematic)
  
    const modelWidth = schematic.get('Width').value
    const modelLength = schematic.get('Length').value
    const blockData = schematic.get('BlockData')
    let blocks = []
    for (let i = 0; i < blockData.length; i++) {
      const value = blockData[i]
      const block = this.parseBlock({
        value,
        index: i,
        width: modelWidth,
        length: modelLength,
        palettes
      })
      if (ignoreAir) {
        const type = block.block.type
        type !== 'air' && blocks.push(block)
      } else {
        blocks.push(block)
      }
    }
    console.log(blockData.length)
    return blocks
  }
}
