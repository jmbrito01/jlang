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

let code = fs.readFileSync('./testCode.jlc').toString();
let vm = new JLang();
vm.addFunction('myname', function (name) {
	console.log(`MY NAME IS: ${name}`);
	return "Result test";
});
let result = vm.execute(code);
console.log(`RESULT: ${result}`);

/* EXAMPLE CODE */

/*let code = fs.readFileSync('./testCode.jlc').toString();
console.log('[ CODE ]');
console.log(code);

let tokens      = Lex(code);
console.log('[ TOKENS ]');
console.log(tokens);

let parser = new Parser();
let tree = parser.parse(tokens);
console.log('[ PARSE TREE ]');
console.log(tree);

fs.writeFileSync('./results.json', JSON.stringify(tree));

let vm = new Interpreter();
vm.run(tree);
console.log(`Value: ${vm.context.getVar('i')}`);
*/
process.exit();