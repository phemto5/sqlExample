module.exports = {
    entry: "./src/index.tsx",
    target: 'node',
    output: {
        filename: "./bin/server.js",
    },
    devtool: "source-map",
    resolve: {
        extensions: ["", ".tsx", ".js", ".webpack.js", ".web.js", ".ts"]
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
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "promise": "Promise",
        // "mssql": "mssql"
        "msnodesql": "msnodesql",
        "msnodesqlv8": "msnodesqlv8",
        "dtrace-provider": "drtrace-provider",
        // "formidable": "formidable"
    }
};