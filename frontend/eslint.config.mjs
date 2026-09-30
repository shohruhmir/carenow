// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      'vue/html-self-closing': ['error', {
        html: {
          normal: 'always',
          void: 'always' // yoki 'always' agar <img /> uslubini yoqtirsang
        }
      }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error",
        {
          "vars": "all",
          "args": "after-used",
          "caughtErrors": "all",
          "ignoreRestSiblings": false,
          "reportUsedIgnorePattern": false
        }
      ]
    }
  }

)
