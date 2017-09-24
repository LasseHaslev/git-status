#! /usr/bin/env node
var shell = require( 'shelljs' );
var colors = require( 'colors' );

// Setup arguments
var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'Argparse example'
});

parser.addArgument(
    [ '-d', '--depth' ],
    {
        help: 'Set how deep you will search for git repos. -1 Equals no restriction. Default: 0.',
        defaultValue: 1,
    }
);
global.options = parser.parseArgs();

var variables = require( './mixins/variables' );
var helpers = require( './mixins/helpers' );
var git = require( './mixins/git' );

var pwd = shell.exec( 'pwd', { silent: true } ).toString().slice(0,-1);
console.log();
console.log( colors.bold.cyan( '--- Checking from: '+ pwd +' ---' ));

global.gitStartPath = shell.pwd().toString();

git.checkGitStatus( pwd );

// Reset after
shell.cd( pwd );
