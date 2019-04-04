/**
 * handle template to package.json
 */
const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const path = require('path')
const minimatch = require('minimatch')
const fs = require('fs')
const rm = require('rimraf').sync

module.exports = function (metadata = {}, src, dest = '.') {
  if (!src) {
    return Promise.reject(new Error(`invalid source: ${src}`))
  }
  return new Promise((resolve, reject) => {
    const metalsmith = Metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(src)
      .destination(dest)
    const configFile = path.join(src, '.mife.config')
    metalsmith.use((files, metalsmith, done) => {
      const meta = metalsmith.metadata()
      const configs = Handlebars.compile(fs.readFileSync(configFile).toString())(meta)
        .split('\n').filter(item => !!item.length);
      delete files['.mife.config']
      Object.keys(files).forEach(fileName => {
        const t = files[fileName].contents.toString()
        if (!configs.includes(fileName)) return;
        files[fileName].contents = new Buffer(Handlebars.compile(t)(meta))
      })
      done()
    }).build(err => {
      rm(src)
      err ? reject(err) : resolve({ dest })
    })
  })
}