#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const download = require('../lib/download');
const generator = require('../lib/global-generator');

program.usage('<project-name>')
  .option('-r, --repository [repository]', 'assign to repository')
  .parse(process.argv);

let projectName = 'global';

const list = glob.sync('*/**/src/components');
let next = undefined

const deleteFolderRecursive = function (path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

if (list.length) {
  let global_src = `./${list[0]}/${projectName}`;
  const hasGlobal = glob.sync(global_src)[0];
  if (hasGlobal) {
    deleteFolderRecursive(global_src);
  }
  next = Promise.resolve(global_src)
} else {
  next = Promise.resolve
    (`./src/components/${projectName}`)
}

go()

function go() {
  next.then(projectName => {
    if (projectName !== '.') {
      fs.mkdirSync(projectName)
      const url = program.repository ? program.repository : 'lsqaisen/mife-library.git#master';
      const target = path.join('.', `${projectName}/cache`)
      download(url, target, `update mife-library to ${projectName}`)
        .then(target => {
          return {
            name: projectName,
            root: projectName,
            downloadTemp: target,
          }
        })
        .then(context => {
          return generator({
            projectName: context.name,
          }, context.downloadTemp, path.parse(context.downloadTemp).dir);
        })
        .then(res => {
          console.log(logSymbols.success, chalk.green('found success:)'))
        })
        .catch(error => {
          console.error(logSymbols.error, chalk.red(`found faild：${error.message}`))
        })
    }
  })
}
