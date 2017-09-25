var shell = require( 'shelljs' );
var helpers = require( './helpers' );
var variables = require( './variables' );

var options = global.options;

module.exports = class Git {

    constructor( files = [] ) {
        this.files = files;
    }

    status() {
        for (var i = 0, len = this.files.length; i < len; i++) {
            this.checkStatusOfPath( this.files[i] );
        }
    }

    checkStatusOfPath( path ) {

        shell.cd( path );

        var response = this.checkGitResponse();

        var currentBranch = this.getCurrentBranchName();
        helpers.buildResponse( response, currentBranch );
        this.checkAllBranches();

    }

    checkGitResponse() {
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

    }

    getCurrentBranchName() {
        return shell.exec( 'git rev-parse --abbrev-ref HEAD', {silent: true} ).toString().slice( 0, -1 );
    }
    checkAllBranches() {
        var currentBranch = this.getCurrentBranchName();
        var branches = this.getAllBranches( currentBranch );
        if (branches.length) {

            for (var i = 0, len = branches.length; i < len; i++) {
                var branch = branches[i];

                shell.exec( 'git checkout ' + branch, { silent: true } );

                var response = this.checkGitResponse();
                helpers.buildResponse( response, branch, true );

            }

            // Reset to last branch
            shell.exec( 'git checkout ' + currentBranch, { silent: true } );
            console.log();
        }
    }
    getAllBranches( currentBranch ) {
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

    checkSubDirectory() {
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
                    this.checkGitStatus();

                } );
            }
        }
    }
}
