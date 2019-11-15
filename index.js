const tc = require("@actions/tool-cache");
const core = require("@actions/core");
const exec = require("@actions/exec");

async function addAtomToPath({channel}) {
	let atomExtractedPath;
	switch (process.platform) {
		case "win32": {
			const atomPath = await tc.downloadTool("https://atom.io/download/windows_zip?channel=" + channel);
			atomExtractedPath = await tc.extractZip(atomPath, "/atom/atom.zip");
			break;
		}
		case "darwin": {
			const atomPath = await tc.downloadTool("https://atom.io/download/mac?channel=" + channel);
			atomExtractedPath = await tc.extractZip(atomPath, "/atom/atom.zip");
			break;
		}
		default: {
			const atomPath = await tc.downloadTool("https://atom.io/download/deb?channel=" + channel);
			atomExtractedPath = await tc.extractZip(atomPath, "/atom/atom.zip");
			break;
		}
	}
	await core.addPath(atomExtractedPath);
	console.log("Atom version:");
	await exec.exec("atom -v");
	console.log("APM version:");
	await exec.exec("apm -v");
}

addAtomToPath({
	channel: core.getInput("channel", {required: true}),
}).catch(err => core.setFailed(`Atom download failed with error: ${err.message}`));
