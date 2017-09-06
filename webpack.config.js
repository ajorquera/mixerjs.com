const path              = require('path')
const package           = require('./package')
const webpack           = require('webpack')
const config            = require('./config')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HTMLWebpackPLugin = require('html-webpack-plugin');

const plugins = [
    new ExtractTextPlugin("css/build.css"),
    new HTMLWebpackPLugin({
        filename: 'index.html',
        template: `./views/index.pug`,
        inject:false
    })
];

const pugOptions = {
    pretty: true,
    data: Object.assign({}, package, config)
}

module.exports = {
    entry: './js/main.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/build.js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCSS: true
                }
            }, {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.pug$/,
                loader: ['raw-loader', {loader: 'pug-html-loader', options:  pugOptions}],
            }, {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true
    },
    performance: {
        hints: false
    },
    plugins,
    devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
    pugOptions.pretty = true;

    module.exports.devtool = '#source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
}
