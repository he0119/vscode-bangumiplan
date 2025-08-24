const { defineConfig } = require("@vscode/test-cli");

module.exports = defineConfig({
  files: "test/**/*.test.js",
  mocha: {
    ui: "bdd",
    timeout: 20000,
    color: true,
  },
});
