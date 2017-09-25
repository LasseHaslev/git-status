var shell = require( 'shelljs' );
var colors = require( 'colors' );

var options = global.options;

const RESPONSE_OK = {
    message: 'Everything is ok',
    icon: '✅',
    color: 'green',
};
const RESPONSE_NOT_PUSHED = {
    message: 'Changes are not pushed to remote',
    icon: '❗️',
    color: 'red',
};
const RESPONSE_UNCOMMITED = {
    message: 'Uncommited changes',
    icon: '⛔️',
    color: 'red',
};

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
        this.path = pathToRepo;
    }

    /**
     * Check status of current branch
     * 
     * @return void
     */
    status() {
        this.checkGitResponse();
    }

    /**
     * Check status of each Branch
     *
     * @return void
     */
    branchStatus( shouldAddSpacing = false ) {
        var currentBranch = this.getCurrentBranchName();
        var branches = this.getAllBranches( currentBranch );
        if (branches.length) {

            for (var i = 0, len = branches.length; i < len; i++) {
                var branch = branches[i];

                shell.exec( 'git checkout ' + branch, { silent: true } );

                this.checkGitResponse(shouldAddSpacing);

            }

            // Reset to last branch
            shell.exec( 'git checkout ' + currentBranch, { silent: true } );
        }
    }

    /**
     * Check git status and format to formated response object
     *
     * @return object
     */
    checkGitResponse( shouldAddSpacing = false ) {
        var statusMessage = shell.exec( 'git status 2>&1', { silent: true } ).toString();

        var response = null;

        if ( this.findStringInString("Your branch is up-to-date", statusMessage)
            && this.findStringInString("clean", statusMessage )
            && this.findStringInString("nothing to commit", statusMessage )) {
            response = RESPONSE_OK;
        }
        else if ( this.findStringInString("nothing to commit", statusMessage )) {
            response = RESPONSE_NOT_PUSHED;
        }
        else if ( this.findStringInString("Your branch is up-to-date", statusMessage) || ! this.findStringInString("nothing to commit, working directory clean", statusMessage )) {
            response = RESPONSE_UNCOMMITED;
        }

        if (response) {
            var spacingBeforeOutput = shouldAddSpacing ? '   ' : '';
            console.log( spacingBeforeOutput + response.icon + '  '
                + colors.bold[ response.color ]( response.message )
                + ' in '
                + colors.cyan( '(' + this.getCurrentBranchName() + ') ' )
                // + this.path
            );
        }
        else {} // Should we add something here?

    }

    findStringInString( needle, haystack ) {
        return haystack.indexOf( needle ) !== -1;
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
