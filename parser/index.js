const
	Language            = require('../language.json'),
	Scope               = require('./scope'),
	PrototypeToken      = require('./prototypeToken');

//TODO: Parse typeof
//TODO: Parse for

class Parser {
	constructor() {
		let parser = this;
		this.symbol_table = {};
		this.token = {};
		this.tokens = [];
		this.position = 0;
		this.scope = null;

		//Symbols
		for (let s of Language.symbols) {
			switch (s.type) {
				case 'symbol':
					this.symbol(s.id);
					break;
				case 'infix':
					this.infix(s.id, s.bp);
					break;
				case 'infixr':
					this.infixr(s.id, s.bp);
					break;
				case 'assignment':
					this.assignment(s.id);
					break;
				case 'prefix':
					this.prefix(s.id);
					break;
			}
		}

		this.symbol('(word)').nud = function () {
			return this;
		};

		this.symbol('this').nud = function () {
			parser.scope.reserve(this);
			this.arity = 'this';
			return this;
		};

		this.infix('?', 20, function led(left) {
			this.first = left;
			this.second = parser.expression(0);
			parser.advance(':');
			this.third = parser.expression(0);
			this.arity = 'ternary';
			return this;
		});

		this.infix('(', 80, function (left) {
			let params = [];
			this.arity = 'binary';
			this.first = left;
			//this.second = params;
			if ((left.arity !== "unary" || left.id !== "function") &&
				left.arity !== "name" && left.id !== "(" &&
				left.id !== "&&" && left.id !== "||" && left.id !== "?" && left.id !== '.') {
				left.error("Expected a variable name.");
			}

			if (parser.token.id !== ')') {
				//if theres parameters lets get them
				while (true) {
					let param = parser.expression(0);
					params.push(param);
					if (parser.token.id !== ',') break;
					parser.advance(',');
				}
			}
			this.second = params;
			parser.advance(')');
			return this;
		});

		this.infix('.', 80, function (left) {
			this.first = left;
			if (parser.token.arity !== 'name') {
				return parser.error(`Expected a property name`);
			}

			parser.token.arity = 'literal';
			this.second = parser.token;
			this.arity = 'binary';
			parser.advance();
			return this;
		});

		this.prefix('(', function () {
			var e = parser.expression(0);
			parser.advance(')');
			return e;
		});


		this.symbol('(literal)').nud = function () {
			return this;
		};

		this.stmt('{', function () {
			parser.scope = Scope.create(parser.scope);
			let body = parser.statements();
			parser.advance('}');
			parser.scope = parser.scope.pop();
			return body;
		});

		this.stmt('var', function () {
			let body = [], name, nextToken;

			while (true) {
				name = parser.token;
				if (name.arity !== 'name') {
					name.error('Expected a variable name.');
				}
				parser.scope.define(name);
				nextToken = parser.advance();
				if (parser.token.id === '=') {
					parser.advance('=');
					nextToken.first = name;
					nextToken.second = parser.expression(0);
					nextToken.arity = 'binary';
					body.push(nextToken);
				}
				if (parser.token.id !== ',') break;

				parser.advance(',');
			}

			parser.advance(';');

			if (!body.length) return null;
			else if (body.length === 1) return body[0];
			else return body;

		});

		this.stmt('while', function () {

			this.first = parser.expression(0);

			this.second = parser.block();
			this.arity = 'statement';
			return this;
		});

		this.stmt('if', function () {
			this.first = parser.expression(0);

			this.second = parser.block();
			this.arity = 'statement';

			if (parser.token.id === 'else') {
				parser.scope.reserve(parser.token);
				parser.advance('else');

				this.third = parser.block();
				//TODO: Implement else if
			}
			else {
				this.third = null;
			}

			return this;
		});

		this.stmt('break', function () {
			parser.advance(';');
			if (parser.token.id != '}') {
				parser.error('Unreachable expression');
			}
			this.arity = 'statement';
			return this;
		});

		this.stmt('ret', function () {
			if (parser.token.id !== ';') {
				this.first = parser.expression(0);
			}
			parser.advance(';');

			if (parser.token.id !== '}') {
				parser.error('Unreachable expression')
			}

			this.arity = 'statement';
			return this;
		});

		this.prefix('func', function () {
			let params = [];
			parser.scope = Scope.create(parser.scope);

			if (parser.token.arity === 'name') {
				parser.scope.define(parser.token);
				this.value = parser.token.value;
				parser.advance();
			}

			if (parser.token.id !== '{') {
				while (true) {
					if (parser.token.arity !== 'name') {
						parser.token.error('Expected a parameter name');
					}
					parser.scope.define(parser.token);
					params.push(parser.token);
					parser.advance();

					if (parser.token.id !== ',') {
						//TODO: Check this, is this really right?
						break;
					}
					parser.advance(',');
				}
			}
			this.first = params;
			parser.advance('{');
			this.second = parser.statements();
			parser.advance('}');
			this.arity = 'function';
			parser.scope = parser.scope.pop();
			return this;
		});

		for (let c of Language.constants) {
			this.constant(c.id, c.value);
		}

		this.scope = Scope.create(this.symbol_table);
	}



	symbol(id, bp) {
		let symbol = this.symbol_table[id];
		if (symbol) {
			if (bp > symbol.lbp) symbol.lbp = bp;
		} else {
			symbol = new PrototypeToken(id, bp);
			this.symbol_table[id] = symbol;
		}
		return symbol;
	}

	infix(id, bp, led) {
		let parser = this;
		let symbol = this.symbol(id, bp);
		symbol.led = led || function (left) {
				this.first = left;
				this.second = parser.expression(bp);
				this.arity = 'binary';
				return this;
			}
		return symbol;
	}

	infixr(id, bp, led) {
		let parser = this;
		let symbol = this.symbol(id, bp);
		symbol.led = led || function (left) {
				this.first = left;
				this.second = parser.expression(bp - 1);
				this.arity = 'binary';
				return this;
			};
		return symbol;
	}

	assignment(id) {
		let parser = this;
		return this.infixr(id, 10, function (left) {
			if (left.arity !== 'name' &&
				left.id !== '.' &&
				left.id !== '[') {
				this.error('Bad l-value');
			}
			this.first = left;
			this.second = parser.expression(9);
			this.assignment = true;
			this.arity = 'binary';
			return this;
		});
	}

	prefix(id, nud) {
		let parser = this;
		let symbol = this.symbol(id);
		symbol.nud = nud || function () {
				this.first = parser.expression(80);
				this.arity = 'unary';
			}
	}

	constant(s, v) {
		let parser = this;
		let x = this.symbol(s);
		x.nud = function() {
			parser.scope.reserve(this);
			this.value = parser.symbol_table[this.id].value;
			this.arity = 'literal';

			return this;
		};
		x.value = v;
		return x;
	}

	expression(rbp) {
		var left,
			tok = this.token;
		this.advance();
		left = tok.nud();
		while (rbp < this.token.lbp) {
			tok = this.token;
			this.advance();
			left = tok.led(left);
		}
		return left;
	}

	statement() {
		if (this.token.std) {
			let token = this.token;
			this.advance();
			this.scope.reserve(token);
			return token.std();
		}
		let v = this.expression(0);
		if (!v.assignment && v.id !== '(') {
			if (v.arity === 'function') {
				this.scope.define(v);
			} else {
				v.error('bad expression statement');
			}
		} else this.advance(';');
		
		return v;
	}

	statements() {
		let body = [];
		while (true) {
			if (this.token.id === '}' || this.token.id === '(end)') break;

			let statement = this.statement();
			if (statement) {
				body.push(statement);
			}
		}

		//Return null if empty statement
		if (!body.length) return null;
		else return body;
	}

	stmt(s, f) {
		let x = this.symbol(s);

		x.std = f;
		return x;
	}

	block() {
		let token = this.token;
		this.advance('{');
		return token.std();
	}

	parse(tokens) {
		this.scope = Scope.create(this.scope);
		this.tokens = tokens;
		this.advance();
		let tree = this.statements();
		this.advance('(end)');
		this.scope = this.scope.pop();
		return tree;
	}



	advance(id) {
		if (id && this.token.id !== id) {
			this.token.error(`Expected ${id}`);
		}
		if (this.position >= this.tokens.length) {
			this.token = this.symbol_table['(end)'];
			return this.token;
		}
		let tok = this.tokens[this.position];
		this.position++;
		let obj;
		switch (tok.type) {
			case 'name':
				obj = this.scope.find(tok.value);
				break;
			case 'symbol':
				obj = this.symbol_table[tok.value];
				break;
			case 'number':
				obj = this.symbol_table['(literal)'];
				break;
			case 'string':
				obj = this.symbol_table['(literal)'];
				break;
			default:
				this.error(`Unexpected token ${tok.value}`);
				break;
		}
		this.token = Object.create(obj);
		this.token.value = this.token.id = tok.value;
		this.token.arity = tok.type;
		return this.token;
	}

	error(msg) {
		console.log(`[ PARSER ERROR ] ${msg}`);
	}
}

module.exports = Parser;