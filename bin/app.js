#! /usr/bin/env node
var shell = require( 'shelljs' );
var colors = require( 'colors' );

var variables = require( './mixins/variables' );
var helpers = require( './mixins/helpers' );
var git = require( './mixins/git' );

var pwd = shell.exec( 'pwd', { silent: true } ).toString().slice(0,-1);
console.log();
console.log( colors.bold.cyan( '--- Checking from: '+ pwd +' ---' ));

git.checkGitStatus( pwd );

// Reset after
shell.cd( pwd );
