const Metalsmith = require('metalsmith');
const rm = require('rimraf').sync;

module.exports = function (metadata = {}, src, dest = '.') {
  if (!src) {
    return Promise.reject(new Error(`invalid source: ${src}`))
  }
  return new Promise((resolve, reject) => {
    Metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(`${src}/src`)
      .destination(dest)
      .use()
      .build(err => {
        rm(src)
        err ? reject(err) : resolve({ dest })
      })
  })
}