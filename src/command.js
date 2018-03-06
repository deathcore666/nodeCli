#!/usr/bin/env node
const program = require('commander');
const { prompt } = require('inquirer');
const { parse } = require('./index');

program
    .version('1.0.0')
    .description('Country phone codes grabber from https://countrycode.org');

program
    .command('run')
    .alias('r')
    .description('Grabs data and places it the data folder, codesJ.json' +
        ' is the default file, use --file to specify filename')
    .action(() => parse());

program
    .command('file <filename>')
    .alias('f')
    .description('Grabs data and places it a file specified in the data folder')
    .action(filename => parse(filename));

program.parse(process.argv);