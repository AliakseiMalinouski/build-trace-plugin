const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js',
    library: {
      type: 'commonjs2',
    },
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  alias: {
    '&settings': path.resolve(__dirname, './src/settings'),
    "&declarations": path.resolve(__dirname, 'src/declarations'),
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript' },
            target: 'es2019',
          },
        },
      },
    ],
  },
};
