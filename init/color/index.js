const Vibrant = require('node-vibrant')
const fs = require('fs')
const path = require('path')

function getTextureColors () {
  const dir = __dirname + '/block/'

  fs.readdir(dir, (err, files) => {
    if (err) {
      throw err
    }
    let colorMap = {}
    let promises = []
    for (let file of files) {
      const [name, _] = file.split('.')
      promises.push(Vibrant.from(dir + file).getPalette().then(p => {
        colorMap[name] = p.Vibrant.getHex()
      }).catch(() => {}))
    }
    Promise.all(promises).then(() => {
      fs.writeFile(path.join(__dirname, '../..', 'data/', 'color.json'), JSON.stringify(colorMap), (err) => {
        if (err) {
          throw err
        }
        console.log('saved!')
      })
    })
  })
}

getTextureColors()
