const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "./static/frontend"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs"],
    // alias per forzare l’estensione richiesta da ESM
    alias: {
      "process/browser": require.resolve("process/browser.js"),
    },
    // consenti import senza estensione anche negli .mjs
    fullySpecified: false,
    // (facoltativo, ma utile) fallback esplicito
    fallback: {
      process: require.resolve("process/browser.js"),
    },
  },
  module: {
    rules: [
      { test: /\.[jt]sx?$/, exclude: /node_modules/, use: { loader: "babel-loader" } },
    ],
  },
  plugins: [
    // inietta la global `process` nel bundle
    new webpack.ProvidePlugin({
      process: "process/browser.js",
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    }),
  ],
  optimization: { minimize: true },
};