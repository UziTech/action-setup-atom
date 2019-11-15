const path = require("path");
const tc = require("@actions/tool-cache");
const core = require("@actions/core");
const exec = require("@actions/exec");

async function downloadAtom(channel = "stable") {
	switch (process.platform) {
		case "win32": {
			const atomPath = await tc.downloadTool("https://atom.io/download/windows_zip?channel=" + channel);
			return await tc.extractZip(atomPath, path.join(process.env.GITHUB_WORKSPACE, "atom"));
		}
		case "darwin": {
			const atomPath = await tc.downloadTool("https://atom.io/download/mac?channel=" + channel);
			return await tc.extractZip(atomPath, path.join(process.env.GITHUB_WORKSPACE, "atom"));
		}
		default: {
			const atomPath = await tc.downloadTool("https://atom.io/download/deb?channel=" + channel);
			return await tc.extractZip(atomPath, path.join(process.env.GITHUB_WORKSPACE, "atom"));
		}
	}
}

async function run() {
	try {
		const channel = core.getInput("channel", {required: true});
		const atomPath = downloadAtom(channel);
		console.log(atomPath);
		await core.addPath(atomPath);
		console.log("Atom version:");
		await exec.exec("atom -v");
		console.log("APM version:");
		await exec.exec("apm -v");
	} catch (error) {
		core.setFailed(`Atom download failed with error: ${error.message}`);
	}
}

run();
