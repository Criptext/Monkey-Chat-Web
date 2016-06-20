var webpack = require('webpack');
var path = require('path');

var config = {
	entry: {
		chat: './index.js'
	},
	output: {
    	path: path.join(__dirname, 'bundle'),
		filename: '[name].js'
	},
	module : {
    	loaders : [{
        	test : /\.js$/,
			exclude : /node_modules/,
			loader : 'babel'
      	}, { 
		    test: /\.css$/,
	        loader: "style!css"
	    }, { 
		    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
	        loader: "file?name=[name].[ext]&limit=10000&mimetype=application/font-woff"
	    }, {
	        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
	        loader: "file?name=[name].[ext]&limit=10000&mimetype=application/font-woff"
	    }, {
	        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
	        loader: "file?name=[name].[ext]&limit=10000&mimetype=application/octet-stream"
	    }, {
	        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
	        loader: "file?name=[name].[ext]"
	    }, {
	        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
	        loader: "file?name=[name].[ext]&limit=10000&mimetype=image/svg+xml"
	    }],
      	plugins: [
	    new webpack.ProvidePlugin({
	        $: "jquery",
	        jQuery: "jquery",
	        'window.jQuery': 'jquery',
	    })
	]
  	}
};

module.exports = config;