module.exports = {
	"env": {
		"commonjs": true,
		"es6": true,
		"node": true,
		"jest": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 2018
	},
	"rules": {
		semi: "error",
		quotes: "error",
		indent: ["error", "tab", { SwitchCase: 1 }],
	}
};
