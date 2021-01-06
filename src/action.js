#!/usr/bin/env node

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
const {downloadAtom, addToPath, printVersions} = require("./setup-atom.js");

async function run() {
	try {
		const channel = (process.env.GITHUB_ACTIONS && core.getInput("channel").toLowerCase()) || process.argv[2] || "stable";
		const folder = path.resolve(process.env.RUNNER_TEMP, process.argv[3] || "./atom");
		core.info(`channel: ${channel}`);
		core.info(`folder: ${folder}`);

		await downloadAtom(channel, folder);
		await addToPath(channel, folder);
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
