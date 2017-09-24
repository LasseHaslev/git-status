var shell = require( 'shelljs' );
var colors = require( 'colors' );

module.exports = {
    needleInHaystack: function(needle, haystack ) {
        return haystack.indexOf( needle ) !== -1;
    },

    buildResponse: function( response, branch, subbranch ) {
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
};
