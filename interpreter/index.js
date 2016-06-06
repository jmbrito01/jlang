const
	Context             = require('./context'),
	Node                = require('./node');

//TODO: Interpret break

class Interpreter {
	constructor() {
		this.context = new Context();
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
		}
	}

	isSimplifiable(node) {
		return node.arity === ('binary' || 'ternary' || 'statement' || 'function');
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
		let value = this.simplify(first);
		
		this.context.setVar('(return)', value);
		
		return value;
	}

	assign(first, second) {
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

	callFunction(first, second) {
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
		
		return funcInt.context.getVar('(return)');
	}

	checkAndAssign(first, second, third) {
		let f = this.getNodeValue(first);
		if (this.isSimplifiable(second)) second = this.simplify(second);
		if (this.isSimplifiable(third)) third = this.simplify(third);
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
		}

		if (result instanceof Node) {
			result = this.getNodeValue(result);
		}

		return result;
	}

	setParent(context) {
		this.context.parent = context;
	}
	
}

module.exports = Interpreter;