#!/usr/bin/env node

const program = require('commander')
program.version('1.0.0')
  .usage('<command> [project-name]')
  .command('init', 'this will run mife-init.js')
  .parse(process.argv)

// test case
// node ./bin/mife.js hello
// node ./bin/mife.js init my-project