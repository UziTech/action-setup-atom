const core = require("@actions/core");
const exec = require("@actions/exec");
const downloadAtom = require("./download-atom.js");

async function run() {
	try {
		const channel = core.getInput("channel", {required: true});
		const atomExtractedPath = downloadAtom(channel);
		await core.addPath(atomExtractedPath);
		console.log("Atom version:");
		await exec.exec("atom -v");
		console.log("APM version:");
		await exec.exec("apm -v");
	} catch (error) {
		core.setFailed(`Atom download failed with error: ${error.message}`);
	}
}

run();
