import pluginVue from 'eslint-plugin-vue';
export default [
  ...pluginVue.configs['flat/recommended'],
  ...pluginVue.configs['flat/essential'],
  ...pluginVue.configs['flat/strongly-recommended'],
  {
    rules: {
      'vue/no-unused-vars': 'error',
      semi: 'error',
      'object-curly-spacing': ['error', 'always'],
      quotes: ['error', 'single']
    },
    languageOptions: {
      'parserOptions': {
        'ecmaVersion': 2020,
        'ecmaFeatures': {
          'jsx': true
        }
      }
    }
  }
];