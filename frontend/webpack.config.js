const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.js',  // Adjust entry point as per your project setup
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        chunkFilename: 'src/js/view/[name].[contenthash].js',
        publicPath: '/',
        assetModuleFilename: 'assets/[name][ext]',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',  // Inject styles into DOM
                    'css-loader',    // Turns CSS into commonjs
                    'postcss-loader', // Apply autoprefixer
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],

    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: '' }, // Copy files from public to dist/public
                { from: 'src/assets', to: 'assets' }
                //{ from: './src/js', to: 'js' }, // Copy files from public to dist/public
            ],
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 5000,
        open: true,
        hot: true,
        historyApiFallback: true,
        devMiddleware: {
            writeToDisk: true,
        },
    },
};