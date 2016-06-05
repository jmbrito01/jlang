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
}

module.exports = Node;