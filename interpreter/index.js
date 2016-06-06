const
	Context             = require('./context'),
	Node                = require('./node'),
	StdLoader           = require('./std'),
	ModuleProperty      = require('./std/moduleProperty');

class Interpreter {
	constructor() {
		this.context = new Context();

		this.std = new StdLoader({
			context: this.context
		});
	}

	run(tree) {
		if (tree) {
			for (let node of tree) {
				var result = this.simplify(node);
				if (!result) throw `ERROR INTERPRETING ${node.id}`;
			}
		}

	}

	simplify(node) {
		switch (node.arity) {
			case 'binary': return this.binarySimplifier(node);
			case 'ternary': return this.ternarySimplifier(node);
			case 'statement': return this.statementSimplifier(node);
			case 'function': return this.functionSimplifier(node);
			case 'this': return this.context.getVar('(this)');
		}
	}

	ternarySimplifier(node) {
		switch (node.id) {
			case '?': return this.checkAndAssign(node.first, node.second, node.third);
		}
	}

	functionSimplifier(node) {
		return this.context.addFunction(node);
	}

	statementSimplifier(node) {
		switch (node.id) {
			case 'if': return this.ifStatement(node.first, node.second, node.third);
			case 'while': return this.whileStatement(node.first, node.second);
			case 'ret': return this.returnStatement(node.first);
			case 'break': return this.breakStatement();
		}
	}

	binarySimplifier(node) {
		switch (node.id) {
			case '=': return this.assign(node.first, node.second);
			case '+': return this.sum(node.first, node.second);
			case '-': return this.subtract(node.first, node.second);
			case '*': return this.multiply(node.first, node.second);
			case '/': return this.divide(node.first, node.second);
			case '==': return this.isEqual(node.first, node.second);
			case '===': return this.isEqualAndType(node.first, node.second);
			case '!=': return this.isDifferent(node.first, node.second);
			case '!==': return this.isDifferentAndType(node.first, node.second);
			case 'and': return this.logicAnd(node.first, node.second);
			case 'or': return this.logicOr(node.first, node.second);
			case '<': return this.isSmaller(node.first, node.second);
			case '<=': return this.isSmallerOrEqual(node.first, node.second);
			case '>': return this.isBigger(node.first, node.second);
			case '>=': return this.isBiggerOrEqual(node.first, node.second);
			case '+=': return this.assignIncrease(node.first, node.second);
			case '-=': return this.assignDecrease(node.first, node.second);
			case '(': return this.callFunction(node.first, node.second);
			case 'mod': return this.mod(node.first, node.second);
			case '.': return this.dot(node.first, node.second);
		}
	}

	ifStatement(first, second, third) {
		let condition = this.simplify(first);
		if (!condition) return condition;
		if (condition instanceof Node) {
			condition = this.getNodeValue(condition);
		}
		if (condition) {
			this.run(second);
		} else {
			this.run(third);
		}
		return true;
	}

	whileStatement(first, second) {
		this.context.setFlag('break', false);

		let condition;
		do {
			condition = this.simplify(first);
			if (!condition) return condition;
			if (condition instanceof Node) {
				condition = this.getNodeValue(condition);
			}
			if (condition) this.run(second);
			
		} while (condition && !this.context.getFlag('break'));

		return true;
	}

	breakStatement() {
		this.context.setFlag('break', true);
		return true;
	}
	
	returnStatement(first) {
		let value;
		if (Interpreter.isSimplifiable(first)) {
			value = this.simplify(first);
		} else {
			value = this.getNodeValue(first);
		}
		
		this.context.setVar('(return)', value);
		
		return Node.createNode(value);
	}

	assign(first, second) {
		if (Interpreter.isSimplifiable(first)) {
			first = this.simplify(first);

			if (first instanceof ModuleProperty) {
				first.value = first;
			}
		}
		switch (second.arity) {
			case 'number':
				this.context.setVar(first.value, second.value);
				return true;
			case 'string':
				this.context.setVar(first.value, second.value);
				return true;
			case 'literal':
				this.context.setVar(first.value, second.value);
				return true;
			case 'name':
				let value = this.context.getVar(second.value);
				this.context.setVar(first.value, value);
				return true;
			case 'binary':
				let node = this.binarySimplifier(second);
				let s = this.getNodeValue(node);
				if (typeof s === 'object' && s.__name) {
					s.__name = first.value;
				}
				this.context.setVar(first.value, s);
				return true;
			default: return false;
		}
	}

	assignIncrease(first, second) {
		switch (second.arity) {
			case 'number':
				var value = this.context.getVar(first.value);
				this.context.setVar(first.value, value+second.value);
				return true;
			case 'string':
				var value = this.context.getVar(first.value);
				this.context.setVar(first.value, value+second.value);
				return true;
			case 'literal':
				var value = this.context.getVar(first.value);
				this.context.setVar(first.value, value+second.value);
				return true;
			case 'name':
				let valueSec = this.context.getVar(second.value);
				var valueFir = this.context.getVar(first.value);
				this.context.setVar(first.value, valueFir + valueSec);
				return true;
			case 'binary':
				let node = this.binarySimplifier(second);
				let s = this.getNodeValue(node);
				var value = this.context.getVar(first.value);
				this.context.setVar(first.value, value+s);
				return true;
			default: return false;
		}
	}

	assignDecrease(first, second) {
		switch (second.arity) {
			case 'number':
				var value = this.context.getVar(first.value);
				this.context.setVar(first.value, value-second.value);
				return true;
			case 'string':
				var value = this.context.getVar(first.value);
				this.context.setVar(first.value, value-second.value);
				return true;
			case 'literal':
				var value = this.context.getVar(first.value);
				this.context.setVar(first.value, value-second.value);
				return true;
			case 'name':
				let valueSec = this.context.getVar(second.value);
				var valueFir = this.context.getVar(first.value);
				this.context.setVar(first.value, valueFir - valueSec);
				return true;
			case 'binary':
				let node = this.binarySimplifier(second);
				let s = this.getNodeValue(node);
				var value = this.context.getVar(first.value);
				this.context.setVar(first.value, value-s);
				return true;
			default: return false;
		}
	}

	sum(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f+s);
	}
	
	subtract(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f-s);
	}
	
	multiply(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f*s);
	}
	
	divide(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f/s);	
	}

	mod(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f % s);
	}

	isEqual(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f==s);
	}

	isEqualAndType(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f===s);
	}

	isDifferent(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f!=s);
	}

	isDifferentAndType(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f!==s);
	}

	isSmaller(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f<s);
	}

	isSmallerOrEqual(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f<=s);
	}

	isBigger(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f>s);
	}

	isBiggerOrEqual(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f>=s);
	}

	logicAnd(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f&&s);
	}

	logicOr(first, second) {
		let f = this.getNodeValue(first);
		let	s = this.getNodeValue(second);

		return Node.createNumber(f||s);
	}

	dot(first, second) {
		let module = this.getNodeValue(first);
		let property = this.getNodeValue(second);
		if (typeof module === 'object') {
			//Is a valid module
			let modProperty = new ModuleProperty({
				module,
				property: property
			});
			return modProperty;
		} else {
			this.error('Invalid first value of dot');
		}
	}

	callFunction(first, second) {
		let self = this;
		if (Interpreter.isSimplifiable(first)) {
			first = this.simplify(first);

			if (first instanceof ModuleProperty) {
				if (first.isFunction()) {
					let args = second.map(function (each) {
						return self.getNodeValue(each);
					});
					let result = first.call(args);
					this.context.setVar('(return)', result);
					return Node.createNode(result);
				}
			}

		} else {
			let func = this.context.getVar(first.value);

			if (!func) {
				console.log(`[ INTERPRET ERROR ] ${first.value} function not found`);
				return false;
			}
			let params = [];
			for (let param of second) {
				params.push(this.getNodeValue(param));
			}

			let funcInt = new Interpreter();
			funcInt.setParent(this.context);
			func.prepareContext(funcInt.context, params);
			funcInt.run(func.body);

			return Node.createNode(funcInt.context.getVar('(return)'));
		}
	}

	checkAndAssign(first, second, third) {
		let f = this.getNodeValue(first);
		if (Interpreter.isSimplifiable(second)) second = this.simplify(second);
		if (Interpreter.isSimplifiable(third)) third = this.simplify(third);
		if (f) return second;
		else return third;
	}

	getNodeValue(node) {
		let result;
		switch (node.arity) {
			case 'number': result = node.value;
				break;
			case 'name': result = this.context.getVar(node.id);
				break;
			case 'literal': result = node.value;
				break;
			case 'binary': result = this.binarySimplifier(node);
				break;
			case 'string': result = node.value;
				break;
			case 'object': result = node.value;
				break;
			case 'this': result = this.simplify(node);
				break;
			case 'moduleProperty': result = node.property;
				break;
		}

		if (result instanceof Node) {
			result = this.getNodeValue(result);
		}

		return result;
	}

	setParent(context) {
		this.context.parent = context;
	}

	static error(txt) {
		console.log(`[ RUNTIME ERROR ] ${txt}`);
	}

	static isSimplifiable(node) {
		return (
			node.arity === 'binary' || node.arity === 'ternary' || node.arity === 'statement' ||
			node.arity === 'function' || node.arity === 'this'
		);
	}
	
}

module.exports = Interpreter;