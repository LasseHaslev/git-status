#! /usr/bin/env node
var shell = require( 'shelljs' );
var colors = require( 'colors' );

const FileFinder = require( './FileFinder' );
const GitRepo = require( './GitRepository' );

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

let finder = new FileFinder();
finder.start( ( files ) => {

    // console.log(files);

    let pwd = shell.pwd();

    files = [ files[0], files[1] ]; // Prevents files to be to long

    for (var i = 0, len = files.length; i < len; i++) {
        var git = new GitRepo( files[i] );


        console.log(); // Add spacing before output
        console.log(
            colors.bold[ 'green' ]( '-- Checking repository at ' + pwd )
        );
        git.status();
        git.branchStatus( true );

    }

    // Reset after
    shell.cd( pwd );
} );
