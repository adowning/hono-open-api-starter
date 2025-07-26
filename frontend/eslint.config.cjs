/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')
const vue = require('eslint-plugin-vue')
const typescriptParser = require('@typescript-eslint/parser')
const typescriptPlugin = require('@typescript-eslint/eslint-plugin')
const prettier = require('eslint-config-prettier')
const vueParser = require('vue-eslint-parser')

module.exports = [
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: typescriptParser,
                ecmaVersion: 'latest',
            },
        },
        plugins: {
            vue: vue,
            '@typescript-eslint': typescriptPlugin,
        },
        rules: {
            ...typescriptPlugin.configs.base.rules,
            ...typescriptPlugin.configs.recommended.rules,
            semi: 'off',
            quotes: 'off',
            'comma-dangle': 'off',
            'vue/html-self-closing': 'off',
            'eslint/no-explicit-any': 'warn',
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptPlugin,
        },
        rules: {
            ...typescriptPlugin.configs.base.rules,
            ...typescriptPlugin.configs.recommended.rules,
            semi: 'off',
            quotes: 'off',
            'comma-dangle': 'off',
        },
    },
    prettier,
]
