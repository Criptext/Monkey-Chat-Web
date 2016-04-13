var webpack = require('webpack');
var path = require('path');

var config = {
	entry: path.resolve(__dirname, 'app/main.js'),
	output: {
		path: path.resolve(__dirname, 'scripts'),
		filename: 'bundle.js'
  	},
  	module : {
    	loaders : [{
        	test : /\.js$/,
			exclude : /node_modules/,
			loader : 'babel'
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