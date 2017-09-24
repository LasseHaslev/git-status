var shell = require( 'shelljs' );
var helpers = require( './helpers' );
var variables = require( './variables' );

var options = global.options;

var git = {
    checkGitResponse: function() {
        var statusMessage = shell.exec( 'git status 2>&1', { silent: true } ).toString();


        if (helpers.needleInHaystack( 'Not a git repository', statusMessage )) {
            return variables.responses.notGit;
        }
        else if ( helpers.needleInHaystack("Your branch is up-to-date", statusMessage)
            && helpers.needleInHaystack("clean", statusMessage )
            && helpers.needleInHaystack("nothing to commit", statusMessage )) {
            return variables.responses.ok;
        }
        else if ( helpers.needleInHaystack("nothing to commit", statusMessage )) {
            return variables.responses.notPushed;
        }
        else if ( helpers.needleInHaystack("Your branch is up-to-date", statusMessage) || ! helpers.needleInHaystack("nothing to commit, working directory clean", statusMessage )) {
            return variables.responses.uncommited;
        }
        else {
            return variables.responses.uncatched;
        }

    },

    getCurrentBranchName: function() {
        return shell.exec( 'git rev-parse --abbrev-ref HEAD', {silent: true} ).toString().slice( 0, -1 );
    },
    checkAllBranches: function() {
        var currentBranch = git.getCurrentBranchName();
        var branches = git.getAllBranches( currentBranch );
        if (branches.length) {

            for (var i = 0, len = branches.length; i < len; i++) {
                var branch = branches[i];

                shell.exec( 'git checkout ' + branch, { silent: true } );

                var response = git.checkGitResponse();
                helpers.buildResponse( response, branch, true );

            }

            // Reset to last branch
            shell.exec( 'git checkout ' + currentBranch, { silent: true } );
            console.log();
        }
    },
    getAllBranches: function( currentBranch ) {
        return shell.exec('git branch', {silent:true}).toString().split( '\n' )
        .map( function(branchName) {
            var name = branchName.replace( /^\**\s+([A-z\-_]+)$/, '$1' )
            return name;
        } )
        .slice(0,-1)
        .filter( function( branchName ) {
            return branchName != currentBranch;
        } );
    },

    checkGitStatus: function( path ) {
        var response = git.checkGitResponse();

        // Run if we should go depper but not too deep
        var depth = git.checkCurrentDepth();
        if ( git.shouldContinue(response) ) {
            git.checkSubDirectory();
            return false;
        }

        var currentBranch = git.getCurrentBranchName();
        helpers.buildResponse( response, currentBranch );
        git.checkAllBranches();

    },

    shouldContinue( response ) {
        return response.continue
            && ( options.depth == -1 || git.checkCurrentDepth() <= options.depth-1 );
    },

    checkCurrentDepth() {
        var relativePathFromStartedPath = shell.pwd().toString().replace( global.gitStartPath, '' );

        // Check how deep it is
        return relativePathFromStartedPath.split( '/' ).length - 1;
    },

    checkSubDirectory: function() {
        var currentPath= shell.pwd();
        var subdirCount = shell.exec('find . -mindepth 1 -maxdepth 1 -type d | wc -l', {silent:true});

        if(subdirCount > 0){
            var files = shell.ls('-d', '*/' );

            if(files){
                files.forEach( function( file ) {

                    if (variables.excludeFolders.indexOf( file ) !== -1) {
                        return false;
                    }

                    // Reset after each
                    shell.cd( currentPath );

                    shell.cd( file );
                    git.checkGitStatus();

                } );
            }
        }
    },
};
module.exports = git;
