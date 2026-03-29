export default {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],

    addons: [
        '@storybook/addon-links',
    ],

    framework: {
        name: '@storybook/react-vite',
        options: {},
    },

    docs: {
        autodocs: true,
    },

    typescript: {
        reactDocgen: 'react-docgen-typescript',
        check: false, // Disable type checking for faster build times
        reactDocgenTypescriptOptions: {
            shouldExtractLiteralValuesFromEnum: true,
            compilerOptions: {
                allowSyntheticDefaultImports: false,
                esModuleInterop: false,
            },
        },
    },
};
