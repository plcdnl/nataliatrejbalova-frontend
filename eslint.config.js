// @ts-check
import antfu from '@antfu/eslint-config'
import graphqlPlugin from '@graphql-eslint/eslint-plugin'
import { globalIgnores } from 'eslint/config'
import withNuxt from './.nuxt/eslint.config.mjs'

/** export default withNuxt( */
export default withNuxt(
  // Your custom configs here
  await antfu(
    {
      formatters: true,
      vue: true,
      pnpm: false,
      unocss: true,
      antislop: true,
    },
  ),
  globalIgnores([
    'dist',
    'node_modules',
    '.output',
    '.nuxt',
    '.storybook',
    'storybook-static',
    '.github',
    'coverage',
    '*.log',
    'nuxt.d.ts',
    '.output',
    '.DS_Store',
    '.vscode',
    '*.md',
    'package.json',
    'package-lock.json',
    'babel.config.js',
    'graphql',
    'types.ts',
    'generated',
    'components.d.ts',
    'icons.d.ts',
    'auto.d.ts',
    'src-tauri',
    'auto-imports.d.ts',
    'schema.graphql',
  ]),
  {
    rules: {
      'unocss/order': 'error', // or "error",
    },
  },
  {
    files: ['**/*.graphql', '**/*.gql'],
    languageOptions: {
      parser: graphqlPlugin.parser,
    },
    plugins: {
      '@graphql-eslint': graphqlPlugin,
    },
    rules: {
      '@graphql-eslint/no-anonymous-operations': 'error',
      '@graphql-eslint/naming-convention': [
        'error',
        {
          OperationDefinition: {
            style: 'PascalCase',
            forbiddenPrefixes: ['Query', 'Mutation', 'Subscription', 'Get'],
            forbiddenSuffixes: ['Query', 'Mutation', 'Subscription'],
          },
        },
      ],
    },
  },
)
