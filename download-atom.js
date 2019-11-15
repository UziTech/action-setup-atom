const tc = require("@actions/tool-cache");

module.exports = async function downloadAtom(channel) {
	switch (process.platform) {
		case "win32": {
			const atomPath = await tc.downloadTool("https://atom.io/download/windows_zip?channel=" + channel);
			return await tc.extractZip(atomPath, "/atom/atom.zip");
		}
		case "darwin": {
			const atomPath = await tc.downloadTool("https://atom.io/download/mac?channel=" + channel);
			return await tc.extractZip(atomPath, "/atom/atom.zip");
		}
		default: {
			const atomPath = await tc.downloadTool("https://atom.io/download/deb?channel=" + channel);
			return await tc.extractZip(atomPath, "/atom/atom.zip");
		}
	}
};
