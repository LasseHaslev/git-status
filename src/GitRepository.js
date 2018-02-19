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

                if (branch == currentBranch) {
                    continue;
                }

                this.stash();
                this.switchToBranch( branch );

                this.checkGitResponse(shouldAddSpacing);

            }

            // Reset to last branch
            this.switchToBranch( currentBranch );
            this.stashPop();
        }
    }

    /**
     * Switch to branch
     *
     * @param string branchName
     *
     * @return void
     */
    stash() {
        shell.exec( 'git stash', { silent: true } );
    }

    stashPop() {
        shell.exec( 'git stash pop', { silent: true } );
    }

    /**
     * Switch to branch
     *
     * @param string branchName
     *
     * @return void
     */
    switchToBranch( branch ) {
        shell.exec( 'git checkout ' + branch, { silent: true } );
    }

    /**
     * Check git status and format to formated response object
     *
     * @return object
     */
    checkGitResponse( shouldAddSpacing = false ) {

        if (this.hasUncommitedChanges()) {
            this.respondWithMessage( RESPONSE_UNCOMMITED, shouldAddSpacing );
            return;
        }

        if (this.isPushedToRemote()) {
            this.respondWithMessage( RESPONSE_OK, shouldAddSpacing );
        }
        else {
            this.respondWithMessage( RESPONSE_NOT_PUSHED, shouldAddSpacing );
        }

    }

    /**
     * Check if current branch has uncommited changes
     *
     * @return boolean
     */
    hasUncommitedChanges() {
        var statusMessage = shell.exec( 'git status --short 2>&1', { silent: true } ).toString();
        return statusMessage !== '';
    }

    /**
     * Check if current branch is pushed to remote
     *
     * @return boolean
     */
    isPushedToRemote() {
        var statusMessage = shell.exec( 'git status --short --branch 2>&1', { silent: true } ).toString();

        // Check if has origin
        if ( ! this.findStringInString("...", statusMessage )) {
            return false;
        }

        // Check if is ahead
        return ! this.findStringInString("ahead", statusMessage );
    }

    /**
     * Respond
     *
     * @return void
     */
    respondWithMessage( response, shouldAddSpacing = false ) {
        var spacingBeforeOutput = shouldAddSpacing ? '   ' : '';
        console.log( spacingBeforeOutput + response.icon + '  '
            + colors.bold[ response.color ]( response.message )
            + ' in '
            + colors.cyan( '(' + this.getCurrentBranchName() + ') ' )
            // + this.path
        );
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
