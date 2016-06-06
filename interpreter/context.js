const 
	Function            = require('./function');

class Context {
	constructor(opts) {
		if (!opts) opts = {};

		this.vars = new Map();
		this.flags = new Map();

		this.parent = opts.parent;
	}
	
	getVar(name) {
		let cur = this;
		while (cur) {
			let variable = cur.vars.get(name);
			if (variable !== undefined) return variable;

			cur = cur.parent;
		}
		return null;
	}
	
	setVar(name, val) {
		let cur = this.parent;
		while (cur) {
			let variable = cur.vars.get(name);
			if (variable !== undefined) {
				return cur.vars.set(name, val);
			}

			cur = cur.parent;
		}
		return this.vars.set(name, val);
	}

	addFunction(node) {
		let func = new Function(node);
		this.setVar(func.name, func);
		return func;
	}
	
	setFlag(f, v) {
		this.flags.set(f, v);
	}
	
	getFlag(f) {
		return this.flags.get(f);
	}
	
	
}

module.exports = Context;