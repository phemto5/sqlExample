
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['bin'].indexOf(x) === -1
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });
module.exports = {
    entry: "./src/index.ts",
    target: 'node',
    output: {
        filename: "server.js",
        path: path.join(__dirname, 'bin')
    },
    devtool: "source-map",
    resolve: {
        extensions: ["", ".tsx", ".js", ".jsx", ".webpack.js", ".web.js", ".ts", ".json"]
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.node$/,
                loader: 'node-loader'
            }
        ],
        preLoaders: [
            {
                test: /\.js$/,
                loader: "source-map-loader",
                exclude: /node_modules/
            }
        ]
    },
    externals: nodeModules
};