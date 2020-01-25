/* globals atom */

describe("atom", () => {
	it("should be the correct channel", function () {
		expect(atom.getReleaseChannel()).toBe("beta");
	});
});
