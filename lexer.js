const 
	Lexer           = require('lex');

//TODO: Filter comments

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
	lexer.addRule(/(\++|<|>|!|-+)(?!=)+|,|\*|\/|&&|\|\||{|}|"|\.|;|:|\?|\(|\)|#|(\+|<|>|!|-)?(=?=?=)/g, function (val) {
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
		openIdx     = -1;

	for (let i = 0;i < tokens.length;i++) {
		let token = tokens[i];

		if (token.type === 'symbol' && token.value === '"') {
			//Is a string token
			if (openIdx !== -1) {
				//The string is between openIdx and i
				let str = "";
				for (let j = openIdx;j < i;j++) {
					str += tokens[j].value;
				}
				result.push({
					type: 'string',
					value: str
				});
				openIdx = -1;
				continue;
			} else {
				openIdx = i+1;
				continue;
			}
		}

		if (openIdx !== -1) continue;

		result.push(token);
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

function filterComments(tokens) {
	let
		result      = [],
		openIdx     = -1;

	for (let i = 0;i < tokens.length;i++) {
		let token = tokens[i];

		if (token.type === 'symbol' && token.value === '#') {
			//Is a string token
			if (openIdx !== -1) {
				//The comment is between openIdx and i
				openIdx = -1;
				continue;
			} else {
				openIdx = i+1;
				continue;
			}
		}

		if (openIdx !== -1) continue;

		result.push(token);
	}

	return result;
}

function filterSpaces(tokens) {
	return tokens.filter(function (each) {
		return each.type !== 'space';
	});
}

function analyse(tokens) {

	//After analysing lets clean up the spaces
	return filterComments(
		filterHex(
			filterSpaces(
				filterStrings(tokens)
			)
		)
	);
}

function lex(code) {
	let tokens = tokenize(code);
	return analyse(tokens);
}

module.exports = lex;