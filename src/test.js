const atom = require("../");
(async () => {
	await atom.downloadAtom(process.argv[2]);
	await atom.addToPath(process.argv[2]);
})();
