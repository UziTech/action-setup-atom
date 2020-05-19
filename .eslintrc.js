module.exports = {
	env: {
		node: true,
	},
	extends: "eslint:recommended",
	parserOptions: {
		ecmaVersion: 2018,
	},
	rules: {
		semi: "error",
		quotes: "error",
		indent: ["error", "tab", { SwitchCase: 1 }],
		"comma-dangle": [2, "always-multiline"],
		eqeqeq: 2,
	},
};
