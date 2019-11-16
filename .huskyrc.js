module.exports = {
	"hooks": {
		"commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
		"pre-push": "npm run check-build"
	}
};
