import * as path from 'path';
import * as webpack from 'webpack';

const getConfig = (env, argv) => {
    let config: webpack.Configuration = {
        entry: './src/index.ts',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: ["babel-loader", "ts-loader"],
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'build'),
            libraryTarget: 'umd',
        },
        optimization: {
            minimize: argv.mode === 'production'
        },
        externals: {
            react: 'react',
            'react-router-dom': 'react-router-dom',
            "@ant-design/icons": "@ant-design/icons",
            "antd": "antd",
            "react-grid-layout": "react-grid-layout",
            "react-plotly.js": "react-plotly.js",
            "html2canvas": "html2canvas",
            "plotly.js": "plotly.js"
        },
    };
    if (argv.mode === 'development') {
        config = {
            ...config,
            devtool: 'eval-source-map',
        }
    }
    return config;
};

export default getConfig;
