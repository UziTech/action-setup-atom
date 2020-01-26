module.exports = {
	"plugins": [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		"@semantic-release/changelog",
		["@semantic-release/exec", {
			"prepareCmd": "npm run build"
		}],
		"@semantic-release/npm",
		"@semantic-release/github",
		"@semantic-release/git",
	],
};
