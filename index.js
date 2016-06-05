const 
	Lex         = require('./lexer'),
	Parser      = require('./parser'),
	Interpreter = require('./interpreter'),
	fs          = require('fs');

let code = fs.readFileSync('./testCode.bl').toString();
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

process.exit();