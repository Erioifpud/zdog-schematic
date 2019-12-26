import Zdog from 'zdog'
import { SchematicV2 } from './schematic'

const canvas: HTMLCanvasElement = document.querySelector('#main')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const input: HTMLInputElement = document.querySelector('#file')
const button = document.querySelector('#button')
button.addEventListener('click', () => {
  const file = input.files[0]
  const reader = new FileReader()
  reader.readAsDataURL(file)

  reader.onload = (e) => {
    const buffer = e.target.result
    // const reader = new nbt.Reader(buffer)
    const [_, content] = buffer.toString().split(',')
    const blocks = new SchematicV2().getBlocks(content)
    blocks.forEach(item => {
      const { block, x, y, z } = item
      new Zdog.Box({
        addTo: illo,
        width: 16,
        height: 16,
        depth: 16,
        scale: 3,
        color: block.color,
        stroke: 1,
        translate: {
          x: x * 48,
          y: -y * 48,
          z: z * 48
        }
      })
    })
  }
})

let illo = new Zdog.Illustration({
  element: '#main',
  dragRotate: true
})

let group = new Zdog.Anchor({
  addTo: illo,
})

function animate () {
  illo.updateRenderGraph()
  requestAnimationFrame(animate)
}

animate()
