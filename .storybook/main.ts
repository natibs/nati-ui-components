import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../projects/ui-components/src/**/*.mdx',
    '../projects/ui-components/src/**/*.stories.@(ts|tsx)',
  ],
  addons: [],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  docs: {
    defaultName: 'Documentation',
  },
};

export default config;
