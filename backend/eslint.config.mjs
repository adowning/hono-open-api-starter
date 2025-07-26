import antfu from '@antfu/eslint-config'

export default antfu(
    {
        type: 'app',
        typescript: true,
        formatters: true,
        perfectionist: false,
        stylistic: {
            indent: 4,
            semi: false,
            quotes: 'single',
        },
        ignores: [
            '**/migrations/*',
            '*.md',
            'src/routes/redtiger/data.ts',
            '**/scripts/*',
        ],
    },
    {
        rules: {
            'no-console': ['off'],
            'antfu/if-newline': ['off'],
            'jsonc/sort-keys': ['off'],
            'style/member-delimiter-style': ['off'],
            'style/operator-linebreak': ['off'],
            'style/comma-dangle': ['off'],
            'style/arrow-parens': ['off'],
            'style/brace-style': ['off'],
            'antfu/no-top-level-await': ['off'],
            'node/prefer-global/process': ['off'],
            'node/no-process-env': ['error'],
            'perfectionist/sort-imports': 'off',
            'perfectionist/sort-exports': 'off',
            'perfectionist/sort-named-imports': 'off',
            'perfectionist/sort-named-exports': 'off',

            'unicorn/filename-case': [
                'error',
                {
                    case: 'kebabCase',
                    ignore: ['README.md'],
                },
            ],
        },
    }
)
