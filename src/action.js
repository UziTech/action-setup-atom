const path = require("path");
if (!process.env.GITHUB_ACTIONS) {
	if (process.env.USERPROFILE) {
		process.env.RUNNER_TEMP = path.resolve(process.env.USERPROFILE, "./temp");
	} else if (process.env.HOME) {
		process.env.RUNNER_TEMP = path.resolve(process.env.HOME, "./temp");
	} else {
		process.env.RUNNER_TEMP = path.resolve("../temp");
	}
}
const core = require("@actions/core");
const {
	downloadAtom,
	addToPath,
	printVersions,
} = require("./setup-atom.js");

async function run() {
	try {
		const channel = (process.env.GITHUB_ACTIONS && core.getInput("channel").toLowerCase());
		if (channel) {
			core.error("'channel' is deprecated. Please use 'version' instead.");
		}
		const version = channel || (process.env.GITHUB_ACTIONS && core.getInput("version").toLowerCase()) || process.argv[2] || "stable";
		const folder = path.resolve(process.env.RUNNER_TEMP, process.argv[3] || "./atom");
		const token = (process.env.GITHUB_ACTIONS && core.getInput("token")) || process.argv[4] || "";
		core.info(`version: ${version}`);
		core.info(`folder: ${folder}`);

		await downloadAtom(version, folder, token);
		await addToPath(version, folder);
		await printVersions();

	} catch (error) {
		if (process.env.GITHUB_ACTIONS) {
			core.setFailed(error.message);
		} else {
			core.error(error);
			process.exit(1);
		}
	}
}

run();
