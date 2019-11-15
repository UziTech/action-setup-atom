const downloadAtom = require("./download-atom.js");
const cp = require("child_process");
const path = require("path");

test("downloads stable atom", async () => {
	await downloadAtom("stable");
});

test("downloads beta atom", async () => {
	await downloadAtom("beta");
});

// shows how the runner will run a javascript action with env / stdout protocol
test("test runs", () => {
	const ip = path.join(__dirname, "index.js");
	console.log(cp.execSync(`node ${ip}`).toString());
});
