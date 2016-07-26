var webpack = require('webpack');
var path = require('path');

var config = {
	devtool: 'eval',
	entry: './index.js',
	output: {
    	path: path.join(__dirname, 'bundle'),
		filename: 'index.js'
	},
	module : {
    	loaders : [{
        	test : /\.js$/,
			exclude : /node_modules/,
			loader : 'babel'
      	}, { 
		    test: /\.css$/,
	        loader: 'style!css'
	    }, { 
		    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
	        loader: 'file?name=[name].[ext]&limit=10000&mimetype=application/font-woff'
	    }, {
	        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
	        loader: 'file?name=[name].[ext]&limit=10000&mimetype=application/font-woff'
	    }, {
	        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
	        loader: 'file?name=[name].[ext]&limit=10000&mimetype=application/octet-stream'
	    }, {
	        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
	        loader: 'file?name=[name].[ext]'
	    }, {
	        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
	        loader: 'file?name=[name].[ext]&limit=10000&mimetype=image/svg+xml'
	    }, {
        	test: /\.js$/,
			exclude: /node_modules/,
			loader: 'eslint-loader'
    	}]
	},
	plugins: [
	    new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('development')
			}
		})
	]
};

module.exports = config;