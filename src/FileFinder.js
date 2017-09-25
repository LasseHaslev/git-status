const ora = require('ora');
const shell = require( 'shelljs' );

module.exports = class FileFinder {
    constructor( options = {} ) {
        this.repositories = [];
        this.depth = options.depth || 1;
    }

    async start( callback = ()=>{} ) {

        this.callback = callback;

        this.spinnerStart();

        this.repositories = await this.getGitRepositoriesInSubfolders();

        this.spinnerSucceed();

        this.respondWeAreDoneFindingFiles();

    }

    spinnerStart() {
        this.spinner = ora('Finding git repositories under ' + shell.pwd()).start();
    }

    spinnerSucceed() {
        this.spinner.succeed( 'Found ' + this.repositories.length + ' repositores.' )
    }

    respondWeAreDoneFindingFiles() {
        this.callback.call( this, this.repositories );
    }

    getGitRepositoriesInSubfolders() {

        return new Promise( ( resolve, reject ) => {
            if (global.options.depth == -1 || global.options.depth == 0) {
                var command = 'find . -name .git -type d -prune';
            }
            else {
                var command = 'find . -name .git -type d -prune -maxdepth ' + ( 1 + parseInt( global.options.depth ) );
            }

            let response = shell.exec( command, {
                silent: true,
                async: true,
            } );

            var self = this;
            response.stdout.on( 'data', async ( data ) => {

                data = self.formatStdoutWithGitReposToGitReposPath(data);

                resolve(data);
            } );

        } );

    }

    formatStdoutWithGitReposToGitReposPath( files ) {
        return files.toString().split( '\n' ).map( ( file ) => {
            return file.replace( '/.git', '' );
        } ).filter( ( file ) => {
            // remove foders that does not exists
            return file != '';
        } ).map( ( file ) => {
            // Format to absolute path from current folder
            return file.replace( /^.\//, shell.pwd() + '/' );
        } );
    }
}
