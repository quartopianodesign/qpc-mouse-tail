const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

// su CodePen gli SVG arrivano dal repo GitHub via jsDelivr, gsap dalla CDN
const CDN_DIR = 'https://cdn.jsdelivr.net/gh/quartopianodesign/qpc-mouse-tail@main/src/archetipi/';
const CDN_SCRIPTS = [
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.1/gsap.min.js',
];

// src/index.html è l'unico template: da qui escono dist/index.html e codepen/index.html
const template = './src/index.html';

// codepen/index.html: documento completo per CodePen 2.0
// (link esterni del template come il font, style.css, CDN, markup, script.js)
const penDocument = () => {
  const src = fs.readFileSync(template, 'utf8');
  const title = src.match(/<title>(.*)<\/title>/)[1];
  const links = src.match(/<head>([\s\S]*?)<\/head>/)[1]
    .split('\n').filter(line => /<link[^>]+https:/.test(line))
    .map(line => '  ' + line.trim() + '\n').join('');
  const body = src.match(/<body>\n*([\s\S]*?)\s*<\/body>/)[1]
    .replace(/^ {2}/gm, '')
    .replace("dir: 'archetipi/'", `dir: '${CDN_DIR}'`)
    .split('\n').map(line => '  ' + line).join('\n');
  const scripts = CDN_SCRIPTS.map(url => `  <script src="${url}"></script>\n`).join('');

  return '<!doctype html>\n<html lang="it">\n<head>\n'
    + '  <meta charset="utf-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + `  <title>${title}</title>\n`
    + links
    + '  <link rel="stylesheet" href="./style.css">\n'
    + scripts
    + '</head>\n<body>\n\n'
    + body
    + '\n\n  <script src="./script.js"></script>\n</body>\n</html>\n';
};

// build del sito: dist/index.html + app.min.js + app.min.css + archetipi/, gsap incluso
const site = {
  name: 'site',
  entry: { app: ['./src/js/app.js', './src/scss/style.scss'] },
  devtool: isDev ? 'source-map' : false,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].min.js',
    clean: true,
  },
  module: {
    rules: [
      { test: /\.s?css$/i, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] },
    ],
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin({ extractComments: false })],
  },
  plugins: [
    new webpack.ProvidePlugin({ gsap: ['gsap', 'gsap'] }),
    new MiniCssExtractPlugin({ filename: '[name].min.css' }),
    new HtmlWebpackPlugin({ template, minify: false }),
    new CopyPlugin({ patterns: [{ from: 'src/archetipi', to: 'archetipi' }] }),
    ...(isDev ? [new BrowserSyncPlugin({
      server: { baseDir: './dist' },
      port: 3000,
      files: ['dist/*'],
      notify: false,
    })] : []),
  ],
};

// build per CodePen: i 3 file del pen, leggibili (index.html completo, script.js, style.css)
// (style.css lo compila sass dopo webpack, vedi "build" in package.json)
const codepen = {
  name: 'codepen',
  entry: './src/js/app.js',
  devtool: false,
  output: {
    path: path.resolve(__dirname, 'codepen'),
    filename: 'script.js',
    clean: true,
  },
  optimization: { minimize: false },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent: penDocument,
      inject: false,
      minify: false,
    }),
  ],
};

module.exports = isDev ? site : [site, codepen];
