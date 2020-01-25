module.exports = {
	"hooks": {
		"pre-commit": "git diff --staged --quiet -- dist || (echo \"Please don't commit the 'dist' folder\" && exit 1)",
		"commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
	}
};
