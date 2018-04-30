module.exports = {
    entry: __dirname + '/src/a11y.js',
    output: {
        path: __dirname + '/dist',
        publicPath: '/dist/',
        filename: 'a11y.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader'
        }]
    }
};
