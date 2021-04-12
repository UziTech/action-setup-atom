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
const tc = require("@actions/tool-cache");
const core = require("@actions/core");
const {exec} = require("@actions/exec");
const {promisify} = require("util");
const cp = require("child_process");
const execAsync = promisify(cp.exec);
const fs = require("fs");
const writeFileAsync = promisify(fs.writeFile);

const CHANNELS = [
	"stable",
	"beta",
	"nightly",
	"dev",
];

async function downloadAtom(version, folder) {
	if (typeof version !== "string") {
		version = "stable";
	}
	if (typeof folder !== "string") {
		folder = path.resolve(process.env.RUNNER_TEMP, "./atom");
	}
	switch (process.platform) {
		case "win32": {
			let downloadFile;
			if (CHANNELS.includes(version)) {
				downloadFile = await tc.downloadTool(`https://atom.io/download/windows_zip?channel=${version}`);
			} else {
				// atom-windows.zip
				downloadFile = await tc.downloadTool(`https://github.com/atom/atom/releases/download/${version}/atom-windows.zip`);
			}
			await tc.extractZip(downloadFile, folder);
			break;
		}
		case "darwin": {
			let downloadFile;
			if (CHANNELS.includes(version)) {
				downloadFile = await tc.downloadTool(`https://atom.io/download/mac?channel=${version}`);
			} else {
				// atom-mac.zip
				downloadFile = await tc.downloadTool(`https://github.com/atom/atom/releases/download/${version}/atom-mac.zip`);
			}
			await tc.extractZip(downloadFile, folder);
			break;
		}
		default: {
			let downloadFile;
			if (CHANNELS.includes(version)) {
				downloadFile = await tc.downloadTool(`https://atom.io/download/deb?channel=${version}`);
			} else {
				// atom-amd64.deb
				downloadFile = await tc.downloadTool(`https://github.com/atom/atom/releases/download/${version}/atom-amd64.deb`);
			}
			await exec("dpkg-deb", ["-x", downloadFile, folder]);
			break;
		}
	}
}

async function addToPath(version, folder) {
	switch (process.platform) {
		case "win32": {
			let atomfolder = "Atom";
			if (CHANNELS.includes(version) && version !== "stable") {
				atomfolder += ` ${version[0].toUpperCase() + version.substring(1)}`;
			} else if (version.includes("-beta")) {
				atomfolder += " Beta";
			}
			const atomPath = path.join(folder, atomfolder, "resources", "cli");
			if (process.env.GITHUB_ACTIONS) {
				core.addPath(atomPath);
			} else {
				await exec("powershell", ["-Command", [
					`[Environment]::SetEnvironmentVariable("PATH", "${atomPath};" + $env:PATH, "Machine")`,
					"Start-Sleep -s 10",
					"Restart-Computer",
					"Start-Sleep -s 10",
				].join(";\n")]);
			}
			break;
		}
		case "darwin": {
			let atomfolder = "Atom";
			if (CHANNELS.includes(version) && version !== "stable") {
				atomfolder += ` ${version[0].toUpperCase() + version.substring(1)}`;
			} else if (version.includes("-beta")) {
				atomfolder += " Beta";
			}
			atomfolder += ".app";
			const atomPath = path.join(folder, atomfolder, "Contents", "Resources", "app");
			await exec("ln", ["-s", path.join(atomPath, "atom.sh"), path.join(atomPath, "atom")]);
			const apmPath = path.join(atomPath, "apm", "bin");
			if (process.env.GITHUB_ACTIONS) {
				core.addPath(atomPath);
				core.addPath(apmPath);
			} else {
				await execAsync(`export "PATH=${atomPath}:${apmPath}:$PATH"`);
				await writeFileAsync("../env.sh", [
					"#! /bin/bash",
					`export "PATH=${atomPath}:${apmPath}:$PATH"`,
				].join("\n"), {mode: "777"});
			}
			break;
		}
		default: {
			const display = ":99";
			await exec(`/sbin/start-stop-daemon --start --quiet --pidfile /tmp/custom_xvfb_99.pid --make-pidfile --background --exec /usr/bin/Xvfb -- ${display} -ac -screen 0 1280x1024x16 +extension RANDR`);
			let atomfolder = "atom";
			if (CHANNELS.includes(version) && version !== "stable") {
				atomfolder += `-${version}`;
			} else if (version.includes("-beta")) {
				atomfolder += "-beta";
			}
			const atomPath = path.join(folder, "usr", "share", atomfolder);
			const apmPath = path.join(atomPath, "resources", "app", "apm", "bin");
			if (process.env.GITHUB_ACTIONS) {
				await core.exportVariable("DISPLAY", display);
				core.addPath(atomPath);
				core.addPath(apmPath);
			} else {
				await execAsync(`export DISPLAY="${display}"`);
				await execAsync(`export "PATH=${atomPath}:${apmPath}:$PATH"`);
				await writeFileAsync("../env.sh", [
					"#! /bin/bash",
					`export DISPLAY="${display}"`,
					`export "PATH=${atomPath}:${apmPath}:$PATH"`,
				].join("\n"), {mode: "777"});
			}
			break;
		}
	}
}

async function printVersions() {
	try {
		core.info((await execAsync("atom -v")).stdout);
		core.info((await execAsync("apm -v")).stdout);
	} catch(e) {
		core.info("Error printing versions:", e);
	}
}

module.exports = {
	downloadAtom,
	addToPath,
	printVersions,
};
