/**
 * Created by stephenmudra on 17/01/15.
 */

var webpack = require('webpack');
var path = require('path');

var definePlugin = new webpack.DefinePlugin({
    __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
    __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
});

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js?[chunkhash]');

module.exports = {
    cache: true,
    entry: {
        main:  './src/Root.jsx'
    },
    output: {
        path: 'public/build',
        filename: '[name].js?[chunkhash]'
    },
    module: {
        loaders: [
            {test: /\.css$/, 	loader: 'style-loader!css-loader'},
            {test: /\.scss$/, 	loader: 'style-loader!css-loader!sass-loader'},
            {test: /\.jsx$/,    loader: 'jsx-loader?harmony'},
            {test: /\.js$/ ,    loader: 'jsx-loader?harmony'},

            { test: /\.gif$/ ,	loader: "url-loader?limit=10000&mimetype=image/gif" },
            { test: /\.jpg$/ ,	loader: "url-loader?limit=10000&mimetype=image/jpg" },
            { test: /\.png$/ ,	loader: "url-loader?limit=10000&mimetype=image/png" },
            { test: /\.woff$/,	loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
            { test: /\.ttf$/,	loader: "file-loader" },
            { test: /\.eot$/,	loader: "file-loader" },
            { test: /\.svg$/,	loader: "file-loader" }
        ]
    },
    resolve: {
        root: path.join(__dirname, "src")
    },
    plugins: [
        definePlugin,
        commonsPlugin
    ]
};