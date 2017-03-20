#! /usr/bin/env node
var shell = require( 'shelljs' );
var colors = require( 'colors' );

var pwd;

var excludeFolders = [
    // '.',
    // '..',
    'node_modules/',
    'vendor/',
];
var responses = {
    notGit: {
        continue: true,
    },
    ok: {
        message: 'Everything is ok',
        continue: false,
        icon: '✅',
        color: 'green',
    },
    notPushed: {
        message: 'Changes are not pushed to remote',
        continue: false,
        icon: '❗️',
        color: 'red',
    },
    uncommited: {
        message: 'Uncommited changes',
        continue: false,
        icon: '⛔️',
        color: 'red',
    },
    uncatched: {
        message: 'We could not this git status response',
        continue: false,
        icon: '❗️',
        color: 'green',
    },
};
    

var init = function() {
    pwd = shell.exec( 'pwd', { silent: true } ).toString().slice(0,-1);
    console.log();
    console.log( colors.bold.cyan( '--- Checking from: '+ pwd +' ---' ));

    checkGitStatus( pwd );
}

var needleInHaystack = function(needle, haystack ) {
    return haystack.indexOf( needle ) !== -1;
}

var checkGitResponse = function() {
    var statusMessage = shell.exec( 'git status 2>&1', { silent: true } ).toString();


    if (needleInHaystack( 'Not a git repository', statusMessage )) {
        return responses.notGit;
    }
    else if ( needleInHaystack("Your branch is up-to-date", statusMessage)
        && needleInHaystack("clean", statusMessage )
        && needleInHaystack("nothing to commit", statusMessage )) {
        return responses.ok;
    }
    else if ( needleInHaystack("nothing to commit", statusMessage )) {
        return responses.notPushed;
    }
    else if ( needleInHaystack("Your branch is up-to-date", statusMessage) || ! needleInHaystack("nothing to commit, working directory clean", statusMessage )) {
        return responses.uncommited;
    }
    else {
        return responses.uncatched;
    }

};

var buildResponse = function( response, branch, subbranch ) {
    if (response.message) {
        var branchSpacing = subbranch ? '   ' : '';
        var branchName = branch ? '(' + branch + ') ' : '';
        console.log( branchSpacing + response.icon + '  '
            + colors.bold[ response.color ]( response.message )
            + ' in '
            + colors.cyan(branchName)
            + shell.pwd()
        );
    }
    // shell.cd( path );
}

var getCurrentBranchName = function() {
    return shell.exec( 'git rev-parse --abbrev-ref HEAD', {silent: true} ).toString().slice( 0, -1 );
}

var checkAllBranches = function() {
    var currentBranch = getCurrentBranchName();
    var branches = getAllBranches( currentBranch );
    if (branches.length) {

        for (var i = 0, len = branches.length; i < len; i++) {
            var branch = branches[i];

            shell.exec( 'git checkout ' + branch, { silent: true } );

            var response = checkGitResponse();
            buildResponse( response, branch, true );

        }

        // Reset to last branch
        shell.exec( 'git checkout ' + currentBranch, { silent: true } );
        console.log();
    }
}

var getAllBranches = function( currentBranch ) {
    return shell.exec('git branch', {silent:true}).toString().split( '\n' )
    .map( function(branchName) {
        var name = branchName.replace( /^\**\s+([A-z\-_]+)$/, '$1' )
        return name;
    } )
    .slice(0,-1)
    .filter( function( branchName ) {
        return branchName != currentBranch;
    } );
}

var checkGitStatus = function( path ) {
    var response = checkGitResponse();

    if (response.continue) {
        checkSubDirectory();
        return false;
    }

    var currentBranch = getCurrentBranchName();
    buildResponse( response, currentBranch );
    checkAllBranches();

};

var checkSubDirectory = function() {
    var currentPath= shell.pwd();
    var files = shell.ls('-d', '*/' );

    files.forEach( function( file ) {

        if (excludeFolders.indexOf( file ) !== -1) {
            return false;
        }

        // Reset after each
        shell.cd( currentPath );

        shell.cd( file );
        checkGitStatus();

    } );
}

init();

// Reset after
shell.cd( pwd );
