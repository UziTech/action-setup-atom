const path = require("path");
const tc = require("@actions/tool-cache");
const core = require("@actions/core");
const exec = require("@actions/exec");

function downloadAtom(channel, folder) {
	switch (process.platform) {
		case "win32":
			return downloadOnWindows(channel, folder);
		case "darwin":
			return downloadOnMacos(channel, folder);
		default:
			return downloadOnLinux(channel, folder);
	}
}

async function downloadOnWindows(channel, folder) {
	const downloadFile = await tc.downloadTool("https://atom.io/download/windows_zip?channel=" + channel);
	await tc.extractZip(downloadFile, folder);
	let atomfolder = "Atom";
	if (channel !== "stable") {
		atomfolder += ` ${channel[0].toUpperCase() + channel.substring(1)}`;
	}
	return [path.join(folder, atomfolder, "resources", "cli")];
}

async function downloadOnMacos(channel, folder) {
	const downloadFile = await tc.downloadTool("https://atom.io/download/mac?channel=" + channel);
	await tc.extractZip(downloadFile, folder);
	let atomfolder = "Atom";
	if (channel !== "stable") {
		atomfolder += ` ${channel[0].toUpperCase() + channel.substring(1)}`;
	}
	atomfolder += ".app";
	const atomPath = path.join(folder, atomfolder, "Contents", "Resources", "app");
	await exec.exec("ln", ["-s", path.join(atomPath, "atom.sh"), path.join(atomPath, "atom")]);
	const apmPath = path.join(atomPath, "apm", "bin");
	return [atomPath, apmPath];
}

async function downloadOnLinux(channel, folder) {
	const downloadFile = await tc.downloadTool("https://atom.io/download/deb?channel=" + channel);
	await exec.exec("/sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -ac -screen 0 1280x1024x16 +extension RANDR");
	await core.exportVariable("DISPLAY", ":99");
	await exec.exec("dpkg-deb", ["-x", downloadFile, folder]);
	let atomfolder = "atom";
	if (channel !== "stable") {
		atomfolder += `-${channel}`;
	}
	const atomPath = path.join(folder, "usr", "share", atomfolder);
	const apmPath = path.join(atomPath, "resources", "app", "apm", "bin");
	return [atomPath, apmPath];
}

module.exports = downloadAtom;
module.exports.windows = downloadOnWindows;
module.exports.macos = downloadOnMacos;
module.exports.linux = downloadOnLinux;
