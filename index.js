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
	const downloadFile = await tc.downloadTool("https://atom.io/download/windows_zip?channel=" + channel);
	const folder = await tc.extractZip(downloadFile, path.join(process.env.GITHUB_WORKSPACE, "atom"));
	let atomfolder = "Atom";
	if (channel !== "stable") {
		atomfolder += ` ${channel[0].toUpperCase() + channel.substring(1)}`;
	}
	return [path.join(folder, atomfolder, "resources", "cli")];
}

async function downloadOnMacos(channel) {
	const downloadFile = await tc.downloadTool("https://atom.io/download/mac?channel=" + channel);
	const folder = path.join(process.env.GITHUB_WORKSPACE, "atom");
	await exec.exec("unzip", ["-q", downloadFile, "-d", folder]);
	let atomfolder = "Atom";
	if (channel !== "stable") {
		atomfolder += ` ${channel[0].toUpperCase() + channel.substring(1)}`;
	}
	atomfolder += ".app";
	const atomPath = path.join(folder, atomfolder, "Contents", "Resources", "app");
	const apmPath = path.join(folder, atomfolder, "Contents", "Resources", "app", "apm", "node_modules", ".bin");
	return [atomPath, apmPath];
}

async function downloadOnLinux(channel) {
	const downloadFile = await tc.downloadTool("https://atom.io/download/deb?channel=" + channel);
	const folder = path.join(process.env.GITHUB_WORKSPACE, "atom");
	await exec.exec("dpkg-deb", ["-x", downloadFile, folder]);
	return [path.join(folder, "usr", "bin")];
}

async function run() {
	try {
		const channel = core.getInput("channel", {required: true}).toLowerCase();
		const paths = await downloadAtom(channel);
		paths.forEach(p => core.addPath(p));
	} catch (error) {
		core.setFailed(`Atom download failed with error: ${error.message}`);
	}
}

run();
