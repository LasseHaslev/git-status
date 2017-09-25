#! /usr/bin/env node
var shell = require( 'shelljs' );
var colors = require( 'colors' );

const FileFinder = require( './FileFinder' );

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
        // defaultValue: -1,
    }
);
global.options = parser.parseArgs();

var variables = require( './mixins/variables' );
var helpers = require( './mixins/helpers' );
const Git = require( './mixins/git' );

let finder = new FileFinder();
finder.start( ( files ) => {

    // console.log(files);

    let pwd = shell.pwd();

    let git = new Git( files );
    git.status();

    // Reset after
    shell.cd( pwd );
} );



