const path              = require('path');
const webpack           = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLWebpackPLugin = require('html-webpack-plugin');

const messages          = require('./config');
const extractLESS       = new ExtractTextPlugin('css/compile.css');
const extractPagePUG    = new ExtractTextPlugin('index.html');
const extractSiteMapPUG = new ExtractTextPlugin('sitemap.xml');

let plugins = [
    extractLESS
];

const files = [
    {input: '/index', output: 'index.html'},
];

plugins = plugins.concat(files.map(file => {
    return new HTMLWebpackPLugin({
        filename: `${file.output}`,
        template: `./views/${file.input}.pug`,
        inject:false
    })
}));

const pugOptions = {
    pretty: true,
    data: messages
}

module.exports = {
    entry: {
        main:  ['whatwg-fetch','./js/main.js']
    },
    output: {
        path: path.resolve(__dirname, "./output"),
        filename: 'js/compile.js'
    },
    module: {
        loaders: [
            { test: /\.less$/i, loader: extractLESS.extract({ use: ['css-loader', {loader: 'less-loader', options: {globalVars: {}}}] })},
            { test: /\.pug$/, loader: ['html-loader', {loader: 'pug-html-loader', options: pugOptions}]}
        ]
    },
    plugins,
    resolve: {
        extensions: ['.js', '.json'],
        alias: {

        }
    }
};
