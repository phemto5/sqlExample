
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
    entry: "./src/index.tsx",
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
        // noParse: [
        //     /formidable/
        // ],
        loaders: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                //exclude: /node_modules/
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
                //exclude: /node_modules/
            },
            {
                test: /\.node$/,
                loader: 'node-loader',
                //exclude: /node_modules/
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
    // {
    //     "react": "React",
    //     "react-dom": "ReactDOM",
    //     "promise": "Promise",
    //     // "mssql": "mssql"
    //     "msnodesql": "msnodesql",
    //     "msnodesqlv8": "msnodesqlv8",
    //     "dtrace-provider": "drtrace-provider",
    //     // "formidable": "formidable"
    // }
};