const path = require('path');

const slsw = require('serverless-webpack')
const nodeExternals = require('webpack-node-externals')
const nodeModulesPath = path.resolve(__dirname, '../../../../node_modules')

module.exports = {
  target: 'node',
  entry: slsw.lib.entries,
  mode: 'development',
  // mode: 'production',
  optimization: {
    minimize: false,
  },
  performance: {
    hints: false,
  },
  devtool: false,
  externals: [
    nodeExternals({
      allowlist: [/^@abcfinite\//],
      modulesDir: nodeModulesPath,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|js)?$/,
        use: {
          loader: 'ts-loader',
          options: { allowTsInNodeModules: true },
        },
      },
    ],
  },
  resolve: {
    modules: ['src', nodeModulesPath],
    extensions: ['.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
    sourceMapFilename: '[file].map',
  },
};