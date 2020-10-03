const path = require('path');
const fs = require('fs');

const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

function _path(p) {
  return path.join(__dirname, p);
}

// Main const
// see more: https://github.com/vedees/webpack-template/blob/master/README.md#main-const
const PATHS = {
  src: path.join(__dirname, '../src'),
  srcPages: path.join(__dirname, '../src/components/pages/index'),
  dist: path.join(__dirname, '../dist'),
  assets: 'assets/'
}

// Pages const for HtmlWebpackPlugin
// see more: https://github.com/vedees/webpack-template/blob/master/README.md#html-dir-folder
const PAGES_DIR = PATHS.srcPages
// const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'))
const walkSync = (dir, fileList = []) => {
  fs.readdirSync(dir).forEach(file => {

    fileList = fs.statSync(path.join(dir, file)).isDirectory()
        ? walkSync(path.join(dir, file), fileList)
        : fileList.concat(path.join(dir, file));

  });
  return fileList;
}
const PAGES = walkSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'))
console.log('PAGES', PAGES);
console.log('PAGES_DIR', PAGES_DIR);


module.exports = {
  // BASE config
  externals: {
    paths: PATHS
  },
  entry: {
    index: './src/components/pages/index/index.js',
  },
  output: {
    filename: `${PATHS.assets}js/[name].js`,
    path: PATHS.dist,
    publicPath: '/'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendors',
          test: /node_modules/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: '/node_modules/'
    },
      {
        test: /\.pug$/,
        use: ['html-loader?attrs=false', 'pug-html-loader']
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      }, {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.(scss)$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {sourceMap: true}
          }, {
            loader: 'postcss-loader',
            options: {sourceMap: true, config: {path: `./postcss.config.js`}}
          }, {
            loader: 'sass-loader',
            options: {sourceMap: true}
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
    ]
  },
  plugins: [
   new MiniCssExtractPlugin({
      filename: `${PATHS.assets}css/[name].css`,
    }),
    new CopyWebpackPlugin([
      {from: `${PATHS.src}/${PATHS.assets}img`, to: `${PATHS.assets}img`},
      {from: `${PATHS.src}/${PATHS.assets}fonts`, to: `${PATHS.assets}fonts`}
    ]),
    // Automatic creation any html pages (Don't forget to RERUN dev server)
    // see more: https://github.com/vedees/webpack-template/blob/master/README.md#create-another-html-files
    // best way to create pages: https://github.com/vedees/webpack-template/blob/master/README.md#third-method-best
    ...PAGES.map(page => {
      return new HtmlWebpackPlugin({
            template: page,
            filename: `./${page.substring(page.lastIndexOf('\\')).replace('.pug', '.html')}`,
            inject: false
          });
        }
    )
  ],
}
