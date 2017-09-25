const shell = require( 'shelljs' );
const colors = require( 'colors' );

const FileFinder = require( './FileFinder' );
const GitRepo = require( './GitRepository' );

module.exports = class GitController {

    constructor() {

        this.pwd = shell.pwd();

        this.setupArguments();
        this.finder = new FileFinder();

    }

    setupArguments() {
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
                // defaultValue: 1,
                defaultValue: -1,
            }
        );
        parser.addArgument(
            [ '--max-repos' ],
            {
                defaultValue: -1,
                help: 'Set max repos to check. ( This option is usually set when developing. )',
            }
        );
        global.options = parser.parseArgs();
    }

    start() {
        this.finder.start( ( files ) => {

            this.files = files;

            this.limitToMaxRepositoriesToHandleBasedOnOption();

            this.runGitStatusOnAllFoundRepositories();

        } );
    }

    limitToMaxRepositoriesToHandleBasedOnOption() {
        return this.files = options.max_repos > 0 ? this.files.slice(0, options.max_repos) : files
    }

    runGitStatusOnAllFoundRepositories() {
        for (var i = 0, len = this.files.length; i < len; i++) {

            this.printWhatGitRepositoryWeAreCurrentlyWorkingWith( this.files[i] );

            var git = new GitRepo( this.files[i] );
            git.status();
            git.branchStatus( true );
        }
    }

    printWhatGitRepositoryWeAreCurrentlyWorkingWith( path ) {
        console.log(); // Add spacing before output
        console.log(
            colors.bold[ 'cyan' ]( '-- Checking status of repository at ' ) + colors.bold[ 'white' ]( path )
        );
    }

}
