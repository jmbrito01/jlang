const 
	Lexer           = require('lex');

function tokenize(code) {

	let lexer = new Lexer();
	let tokens = [];
	//Numbers and decimals
	lexer.addRule(/(?:\d*\.)?\d+/, function (val) {
		tokens.push({
			type: 'number',
			value: parseFloat(val)
		});
	});

	//Letters as words
	lexer.addRule(/[a-zA-Z][a-zA-Z0-9]*/, function (val) {
		tokens.push({
			type: 'name',
			value: val
		});
	});

	//Spaces    
	lexer.addRule(/\s/, function () {
		tokens.push({
			type: 'space',
			value: ' '
		});
	});

	//Symbol
	lexer.addRule(/(\++|<|>|!|-+)(?!=)+|,|\*|\/|&&|\|\||{|}|"|'|;|:|\(|\)|(\+|<|>|!|-)?(=?=?=)/g, function (val) {
		tokens.push({
			type: 'symbol',
			value: val
		});
	});

	lexer.setInput(code);
	lexer.lex();
	return tokens;
}

function filterStrings(tokens) {
	let
		result      = [],
		opened      = false,
		stringNext  = false;

	for (let token of tokens) {
		if (token.value === '"' || token.value === "'" ) {
			if (opened) {
				opened = false;
				stringNext = true;
			} else {
				opened = true;
			}
		} else {
			if (stringNext) {
				result[result.length-1].type = 'string';
				stringNext = false;
			}
			result.push(token);
		}
	}

	return result;
}

function filterHex(tokens) {
	let result = [];

	for (let i = 0;i < tokens.length;i++) {
		let token = tokens[i];
		if (token.type === 'number' && !token.value) {
			//Is number and 0
			let next = tokens[result.length+1];
			if (next.type === 'name' && next.value[0] === 'x') {
				//Is a hex value
				let value = parseInt(`0${next.value}`);
				token = {
					type: 'number',
					value
				};
				i++;
			}
		}
		result.push(token);
	}

	return result;
}

function analyse(tokens) {

	//After analysing lets clean up the spaces
	let filtered = tokens.filter(function (each) {
		return each.type !== 'space';
	});

	return filterHex(filterStrings(filtered));
}

function lex(code) {
	let tokens = tokenize(code);
	return analyse(tokens);
}

module.exports = lex;