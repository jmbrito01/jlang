const 
	Lex         = require('./lexer'),
	Parser      = require('./parser'),
	Interpreter = require('./interpreter'),
	fs          = require('fs');

class JLang {
	constructor() {
		this.vm = new Interpreter();
	}

	execute(code) {
		let tokens = Lex(code);
		let parser = new Parser();
		let tree = parser.parse(tokens);

		return this.vm.run(tree);
	}

	addFunction(name, fn) {
		this.vm.addFunction(name, fn);
	}
}

module.exports = JLang;