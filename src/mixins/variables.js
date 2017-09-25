module.exports = {
    responses: {
        ok: {
            message: 'Everything is ok',
            icon: '✅',
            color: 'green',
        },
        notPushed: {
            message: 'Changes are not pushed to remote',
            icon: '❗️',
            color: 'red',
        },
        uncommited: {
            message: 'Uncommited changes',
            icon: '⛔️',
            color: 'red',
        },
        uncatched: {
            message: 'We could not this git status response',
            icon: '❗️',
            color: 'green',
        },
    },
};
