#!/usr/bin/env node

const program = require('commander')
program.version('1.0.0')
  .usage('<command> [project-name]')
  .command('init', 'this will run mife-cli-init.js')
  .command('library', 'this will run mife-cli-library.js')
  .parse(process.argv)