const path = require("path");
const webpack = require("webpack");
const { override } = require("customize-cra");

const addAdditionalTranspileRules = () => (config) => {
  const moduleRule = config.module.rules.find((rule) => Array.isArray(rule.oneOf));

  if (!moduleRule) {
    return config;
  }

  const babelLoader = moduleRule.oneOf.find(
    (rule) => rule.loader && rule.loader.includes("babel-loader") && rule.include
  );

  if (!babelLoader) {
    return config;
  }

  const packagesToTranspile = [
    "reactflow",
    "@reactflow",
    "emoji-mart",
    "apexcharts",
  ];

  const includePaths = packagesToTranspile.map((pkg) =>
    path.resolve(__dirname, `node_modules/${pkg}`)
  );

  const esmRule = {
    test: /\.js$/,
    include: includePaths,
    use: {
      loader: babelLoader.loader,
      options: {
        ...babelLoader.options,
      },
    },
  };

  moduleRule.oneOf.unshift(esmRule);

  return config;
};

const addProcessPolyfill = () => (config) => {
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
    })
  );

  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    process: "process/browser",
  };

  return config;
};

module.exports = override(addAdditionalTranspileRules(), addProcessPolyfill());
