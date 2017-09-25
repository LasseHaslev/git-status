var shell = require( 'shelljs' );
var helpers = require( './mixins/helpers' );
var variables = require( './mixins/variables' );

var options = global.options;

module.exports = class GitRepository {

    /**
     * Set path to GitRepository path
     *
     * @param string pathToRepo
     * @return void
     */
    constructor( pathToRepo ) {
        // Move into folder
        shell.cd( pathToRepo );
    }

    /**
     * Check status of current branch
     * 
     * @return void
     */
    status() {

        var response = this.checkGitResponse();

        var currentBranch = this.getCurrentBranchName();
        helpers.buildResponse( response, currentBranch );

    }

    /**
     * Check status of each Branch
     *
     * @return void
     */
    branchStatus() {
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

    /**
     * Check git status and format to formated response object
     *
     * @return object
     */
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

    /**
     * Get current git repo branch name
     *
     * @return string
     */
    getCurrentBranchName() {
        return shell.exec( 'git rev-parse --abbrev-ref HEAD', {silent: true} ).toString().slice( 0, -1 );
    }

    /**
     * Get all branches except
     *
     * @param currentBranch
     *
     * @return string
     */
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
}
