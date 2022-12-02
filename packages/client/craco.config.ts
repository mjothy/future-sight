import CracoLessPlugin = require('craco-less');

module.exports = {
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: {
                            '@primary-color': '#2a8bff',
                            "@link-color": "#2a8bff", // link color
                            "@font-family": "Rubik, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n" +
                                "  'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',\n" +
                                "  'Noto Color Emoji'" // font
                        },
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
};
