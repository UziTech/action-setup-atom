const path = require("path");
const tc = require("@actions/tool-cache");
const core = require("@actions/core");
const exec = require("@actions/exec");

function downloadAtom(channel = "stable") {
	switch (process.platform) {
		case "win32":
			return downloadOnWindows(channel);
		case "darwin":
			return downloadOnMacos(channel);
		default:
			return downloadOnLinux(channel);
	}
}

async function downloadOnWindows(channel) {
	const atomPath = await tc.downloadTool("https://atom.io/download/windows_zip?channel=" + channel);
	const folder = await tc.extractZip(atomPath, path.join(process.env.GITHUB_WORKSPACE, "atom"));
	let atomfolder = "Atom";
	if (channel !== "stable") {
		atomfolder += ` ${channel[0].toUpperCase() + channel.substring(1)}`;
	}
	return path.join(folder, atomfolder, "resources", "cli");
}

async function downloadOnMacos(channel) {
	const atomPath = await tc.downloadTool("https://atom.io/download/mac?channel=" + channel);
	console.log(atomPath);
	const folder = path.join(process.env.GITHUB_WORKSPACE, "atom");
	console.log(folder);
	await exec.exec("unzip", [atomPath, "-d", folder]);
	await exec.exec("ls", [folder]);
	let atomfolder = "Atom";
	if (channel !== "stable") {
		atomfolder += ` ${channel[0].toUpperCase() + channel.substring(1)}`;
	}
	atomfolder += ".app";
	const apmPath = path.join(folder, atomfolder, "Contents", "Resources", "app", "apm", "node_modules", ".bin");
	return path.join(folder, atomfolder, "Contents", "Resources", "app") + path.delimiter + apmPath;
}

async function downloadOnLinux(channel) {
	const atomPath = await tc.downloadTool("https://atom.io/download/deb?channel=" + channel);
	return await tc.extractZip(atomPath, path.join(process.env.GITHUB_WORKSPACE, "atom"));
}

async function run() {
	try {
		const channel = core.getInput("channel", {required: true}).toLowerCase();
		const atomPath = await downloadAtom(channel);
		await core.addPath(atomPath);
	} catch (error) {
		core.setFailed(`Atom download failed with error: ${error.message}`);
	}
}

run();
