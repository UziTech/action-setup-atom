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
const {downloadAtom, addToPath} = require("./setup-atom.js");

async function run() {
	try {
		const channel = (process.env.GITHUB_ACTIONS && core.getInput("channel").toLowerCase()) || process.argv[2] || "stable";
		const isSnap = Boolean((process.env.GITHUB_ACTIONS && core.getInput("snap").toLowerCase()) || process.argv[3] || false);
		const folder = path.resolve(process.env.RUNNER_TEMP, process.argv[3] || "./atom");
		console.log("channel:", channel);
		console.log("folder:", folder);

		await downloadAtom(channel, folder, isSnap);
		await addToPath(channel, folder);

	} catch (error) {
		if (process.env.GITHUB_ACTIONS) {
			core.setFailed(error.message);
		} else {
			console.error(error);
			process.exit(1);
		}
	}
}

run();
