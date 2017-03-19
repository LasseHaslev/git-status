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
    console.log( 'Checking git statuses from:' );
    pwd = shell.exec( 'pwd' ).toString();
    console.log('');

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
    else if ( needleInHaystack("Your branch is up-to-date", statusMessage) && needleInHaystack("nothing to commit", statusMessage )) {
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

var buildResponse = function( response, advanced ) {
    if (response.message) {
        if (advanced) {
            console.log( colors.green( '--- ' + shell.pwd() + ' ---' ) );
            console.log( 'Status: '.bold.white + colors.green( response.icon + '  ' + response.message ) );
            // console.log( 'File:   '.bold.white + shell.pwd() );
            console.log();
        }
        else {
            console.log(response.icon + '  '
                + colors.bold[ response.color ]( response.message )
                + ' in ' + shell.pwd()
            );
        }
    }
    // shell.cd( path );
}

var checkGitStatus = function( path ) {
    var response = checkGitResponse();

    buildResponse( response );

    if (response.continue) {
        checkSubDirectory();
    }
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