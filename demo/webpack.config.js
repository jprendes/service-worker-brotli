const path = require("path");
const CompressionPlugin = require("compression-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: path.resolve(__dirname, "src", "index.js"),
    output: {
        path: path.resolve(__dirname, "dist", "webpack"),
        filename: "[name].[contenthash].bundle.js",
        clean: { keep: /\.tar\.br$/ },
        chunkFilename(pathData) {
            // Work around Webpack assigning a hashed names to the service worker
            if (pathData.chunk.name === "service-worker") return "service-worker.js";
            return "[id].js";
        },
    },
    plugins: [
        new HtmlWebpackPlugin({ title: "Brotli Service Worker" }),
        new CompressionPlugin({ algorithm: "gzip" }),
        new CompressionPlugin({
            algorithm: "brotliCompress",
            filename: "[path][base].br",
        }),
    ],
};
