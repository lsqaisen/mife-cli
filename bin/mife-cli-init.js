#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const inquirer = require('inquirer');
const latestVersion = require('latest-version');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const download = require('../lib/download');
const generator = require('../lib/generator');

program.usage('<project-name>')
  .option('-r, --repository [repository]', 'assign to repository')
  .parse(process.argv);

let projectName = program.args[0];

if (!projectName) {
  // Project-name is empty, showing --help(project-name为空，显示--help)
  program.help()
  return
}

const list = glob.sync('*');
let rootName = path.basename(process.cwd());
let next = undefined

if (list.length) {
  if (list.filter(name => {
    const fileName = path.resolve(process.cwd(), path.join('.', name))
    const isDir = fs.lstatSync(fileName).isDirectory();
    return name.indexOf(projectName) !== -1 && isDir
  }).length !== 0) {
    console.log(`${projectName} directory is exist`)
    return
  }
  next = Promise.resolve(projectName)
} else if (rootName === projectName) {
  next = inquirer.prompt([
    {
      name: 'buildInCurrent',
      message: 'The current directory is empty and the directory name is the same as the project name. Do you want to create a new project directly in the current directory?',
      // message: '当前目录为空，目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
      type: 'confirm',
      default: true
    }
  ]).then(answer => {
    return Promise.resolve(answer.buildInCurrent ? projectName : '.')
  })
} else {
  next = Promise.resolve(projectName)
}

go()

function go() {
  next.then(projectName => {
    if (projectName !== '.') {
      fs.mkdirSync(projectName)
      const url = program.repository ? program.repository : 'lsqaisen/mife-demo.git#master';
      const target = path.join(projectName || '.', projectName)
      download(url, target)
        .then(target => {
          return {
            name: projectName,
            root: projectName,
            downloadTemp: target
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
