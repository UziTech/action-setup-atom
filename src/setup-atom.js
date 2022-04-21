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
const { Octokit } = require("@octokit/rest");
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

async function downloadAtom(version, folder, token) {
	if (typeof version !== "string") {
		version = "stable";
	}
	if (typeof folder !== "string") {
		folder = path.resolve(process.env.RUNNER_TEMP, "./atom");
	}
	if (typeof token !== "string") {
		token = "";
	}
	switch (process.platform) {
		case "win32": {
			const downloadFile = await tc.downloadTool(await findUrl(version, token));
			await tc.extractZip(downloadFile, folder);
			break;
		}
		case "darwin": {
			const downloadFile = await tc.downloadTool(await findUrl(version, token));
			await tc.extractZip(downloadFile, folder);
			break;
		}
		default: {
			const downloadFile = await tc.downloadTool(await findUrl(version, token));
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

async function findUrl(version, token) {
	if (CHANNELS.includes(version)) {
		const octokit = new Octokit({auth: token});
		const {data: releases} = await octokit.rest.repos.listReleases({
			owner: "atom",
			repo: "atom",
			per_page: 100,
		});
		let release;
		if (version === "stable") {
			release = releases.find(r => !r.draft && !r.prerelease);
		} else {
			release = releases.find(r => !r.draft && r.prerelease && r.tag_name.includes(version));
		}
		if (release) {
			version = release.tag_name;
		}
	}

	switch (process.platform) {
		case "win32": {
			// atom-windows.zip
			return `https://github.com/atom/atom/releases/download/${version}/atom-windows.zip`;
		}
		case "darwin": {
			// atom-mac.zip
			return `https://github.com/atom/atom/releases/download/${version}/atom-mac.zip`;
		}
		default: {
			// atom-amd64.deb
			return `https://github.com/atom/atom/releases/download/${version}/atom-amd64.deb`;
		}
	}
}

module.exports = {
	downloadAtom,
	addToPath,
	printVersions,
	findUrl,
};
