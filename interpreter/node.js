class Node {
	constructor(opts) {
		this.arity = opts.arity;
		this.id = opts.id;
		this.value = opts.value;
	}

	static createNumber(val) {
		return new Node({
			arity: 'number',
			id: val,
			value: val
		});
	}
	
	static createText(val) {
		return new Node({
			arity: 'string',
			id: val,  
			value: val
		});
	}

	static createLiteral(val) {
		return new Node({
			arity: 'literal',
			id: val,
			value: val
		});
	}

	static createObject(val) {
		if (val === null) {
			return Node.createLiteral(val);
		}

		return new Node({
			arity: 'object',
			id: val,
			value: val
		});
	}
	
	static createNode(val) {
		switch (typeof val) {
			case 'object': return Node.createObject(val);
			case 'string': return Node.createText(val);
			case 'number': return Node.createNumber(val);
			case 'boolean': return Node.createLiteral(val);
		}
	}
}

module.exports = Node;