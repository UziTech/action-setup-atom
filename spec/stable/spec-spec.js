/* globals atom */

describe("atom", () => {
	it("should be the correct channel", function () {
		expect(/^\d+\.\d+\.\d+$/.test(atom.appVersion)).toBe(true);
	});
});
