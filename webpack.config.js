var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: 'eval',

    context: __dirname,

    entry: { 'application': [
        'webpack-hot-middleware/client',
        './client'
    ]},

    output: {
        filename: 'bundle.js',
        chunkFilename: 'bundle.js',
        path: __dirname + '/public',
        publicPath: '/'
    },

    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],

    module: {
        loaders: [
            { test: /\.js|.jsx$/, loader: 'babel', exclude: /node_modules/ },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' }
            /*{ test: /\.css$/, loader: 'style-loader!css-loader?modules' },
             { test: /\.scss$/, loader: 'style-loader!css-loader?modules!sass-loader' }*/
        ]
    },

    resolve: {
        extensions: ['', '.js', '.jsx', '.css', '.scss'],
        modulesDirectories: ['client', 'node_modules']
    }
};
