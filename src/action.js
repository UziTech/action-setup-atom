const path = require("path");
const core = require("@actions/core");
const downloadAtom = require("./download.js");

async function run() {
	try {
		const channel = core.getInput("channel", {required: true}).toLowerCase();
		const folder = path.join(process.env.GITHUB_WORKSPACE, "atom");
		const paths = await downloadAtom(channel, folder);
		paths.forEach(p => core.addPath(p));
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
