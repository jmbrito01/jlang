function nodeRequire(module) {
	try {
		return require(module);
	} catch (e) {
		throw e;
	}
}

module.exports = {
	require: nodeRequire
};