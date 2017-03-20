module.exports = {
    excludeFolders: [
        // '.',
        // '..',
        'node_modules/',
        'vendor/',
    ],
    responses: {
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
    },
};
