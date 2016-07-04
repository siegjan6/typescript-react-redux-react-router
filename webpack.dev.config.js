'use strict';

/**
 * Created by x on 11/23/15.
 */
var path = require('path');

/**
 * 导入文件入口
 * @type {{index: string, details: string}|exports|module.exports}
 */
var webpack           = require('webpack');
//提取公用CSS
var ExtractTextPlugin = require("extract-text-webpack-plugin");
//var HtmlWebpackPlugin = require('html-webpack-plugin');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToSrc  = path.resolve(__dirname, 'src');
var pathToBuild  = path.resolve(__dirname, 'www');
var config = {
    pathToBuild: pathToBuild,
    devtool: "source-map",
    //入口文件配置
    entry: {
        app: [
            'webpack-dev-server/client?http://127.0.0.1:8676',
            'webpack/hot/only-dev-server',
            path.resolve(__dirname, 'ts/index')
        ]
    },
    resolve:     {
        extensions: ['', '.js', '.jsx','.ts','.tsx']
    },
    //输出文件配置
    output:      {
        path: path.resolve(__dirname, 'www/dist'),
        chunkFilename: '[name].js',
        filename:   '[name].js',
        publicPath: '/dist/'
    },
    module:      {
        loaders: [
            {
                test:    /\.(js|jsx|tsx|ts)?$/,
                loaders:['ts-loader'],
                //loaders: ['react-hot', 'babel','ts-loader'],
                exclude: /node_modules/
            },
            {
                test:   /\.css$/,
                loader: 'style!css'
            }
        ],
    },
    preLoaders: [
        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        { test: /\.js$/, loader: "source-map-loader" }
    ],
    plugins:     [
        new webpack.optimize.CommonsChunkPlugin({
            name: "common",
            filename:"common.js"
        }),
        new webpack.HotModuleReplacementPlugin(),
        /*new HtmlWebpackPlugin({
            title: 'react 组件',
            addLinkCss:[ '/styles/iconfont.css','/styles/app.css'],
            template: './templates/index.html'
        })*/
    ]
};


module.exports = config;
