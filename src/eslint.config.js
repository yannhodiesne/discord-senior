// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	// @ts-expect-error eslint js typing is weird
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		ignores: [
			"build/",
			".yarn/",
		],
		rules: {
			// https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html
			// "import/prefer-default-export": "off",
			// "import/no-default-export": "error",
			// Use function hoisting to improve code readability
			"no-use-before-define": [
				"error",
				{ "functions": false, "classes": true, "variables": true },
			],
			"@typescript-eslint/no-use-before-define": [
				"error",
				{ "functions": false, "classes": true, "variables": true, "typedefs": true },
			],
			"arrow-parens": ["error", "always"],
			"comma-dangle": [
				"error",
				{
					"arrays": "always-multiline",
					"objects": "always-multiline",
					"imports": "always-multiline",
					"exports": "always-multiline",
					"functions": "ignore",
				},
			],
			"function-paren-newline": ["error", "consistent"],
			"no-tabs": "off",
			"@typescript-eslint/indent": [
				"error",
				"tab",
				{
					"ignoredNodes": [],
					"SwitchCase": 1,
				},
			],
			// "import/no-cycle": "error",
			"no-multiple-empty-lines": ["error", { "max": 1, "maxBOF": 0, "maxEOF": 0 }],
			"no-plusplus": "off",
			"object-curly-newline": ["warn", { "consistent": true, "multiline": true }],
			"padding-line-between-statements": [
				"error",
				{ "blankLine": "always", "prev": "*", "next": "return" },
			],
			"prefer-promise-reject-errors": "off",
			// "import/extensions": ["error", "never"],
			// "import/first": "error",
			// "import/newline-after-import": "error",
			// "import/no-duplicates": "error",
			// "import/order": 0,
			"class-methods-use-this": 0,
		},
	}
);
