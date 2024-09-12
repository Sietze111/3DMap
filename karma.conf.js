import webpack from "webpack";
import path from "path";

export default function (config) {
  config.set({
    frameworks: ["jasmine"],
    files: [
      "src/**/*.spec.ts", // Adjust this path according to where you put your test files
    ],
    preprocessors: {
      "src/**/*.spec.ts": ["webpack"],
    },
    webpack: {
      mode: "development",
      resolve: {
        extensions: [".ts", ".tsx", ".js"],
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: "ts-loader",
            exclude: /node_modules/,
          },
        ],
      },
      output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
      },
    },
    browsers: ["Chrome"],
    singleRun: true,
  });
}
