module.exports = {
  stories: [
    "../src/**/*.stories.tsx",
    "../src/**/*.stories.ts"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    "@storybook/addon-coverage"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {
    autodocs: "tag"
  },
  env: (config) => ({
    ...config,
    VITE_APP_NAME: "SUPLOCK",
    VITE_APP_VERSION: "1.0.0"
  })
};
