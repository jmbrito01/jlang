class PrototypeToken {
	constructor(id, bp) {
		this.id = id;
		this.lbp = bp || 0;

	}

	led() {
		this.error('Undefined');
	}

	nud() {
		this.error('Missing operator!');
	}

	error(msg) {
		console.log(`[ ERROR ] ${msg}`);
	}
}

module.exports = PrototypeToken;