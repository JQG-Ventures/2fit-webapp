/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-circular',
            severity: 'error',
            from: {},
            to: {
                circular: true,
            },
        },
        {
            name: 'types-no-runtime-imports',
            severity: 'error',
            from: {
                path: '^app\\/(_interfaces|_types)',
            },
            to: {
                pathNot: '^app\\/(_interfaces|_types)',
            },
        },
        {
            name: 'services-no-components',
            severity: 'error',
            from: {
                path: '^app\\/_services',
            },
            to: {
                path: '^app\\/_components',
            },
        },
        {
            name: 'services-no-hooks',
            severity: 'error',
            from: {
                path: '^app\\/_services',
            },
            to: {
                path: '^app\\/_hooks',
            },
        },
        {
            name: 'hooks-no-components',
            severity: 'error',
            from: {
                path: '^app\\/_hooks',
            },
            to: {
                path: '^app\\/_components',
            },
        },
    ],
    options: {
        doNotFollow: {
            path: 'node_modules',
        },
        exclude: {
            path: '^(node_modules|public|\\.next)',
        },
        tsConfig: {
            fileName: 'tsconfig.json',
        },
    },
};
