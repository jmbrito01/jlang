const 
	vm					= require('vm'),
	Function            = require('./function'),
	ModuleProperty      = require('./std/moduleProperty');

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

	entries() {
		return this.vars.entries();
	}
	
	setVar(name, val) {
		let cur = this;
		while (cur) {
			if (name instanceof ModuleProperty) {
				let variable = cur.vars.get(name.module.__name);
				if (variable) {
					variable[name.name] = val;
					cur.vars.set(name.module, variable);
				}
			} else {
				let variable = cur.vars.get(name);
				if (variable !== undefined) {
					return cur.vars.set(name, val);
				}
			}

			cur = cur.parent;
		}
		return this.vars.set(name, val);
	}

	addFunction(name, fn) {
		let func = new Function(fn, name);
		this.setVar(func.name, func);
		return func;
	}
	
	setFlag(f, v) {
		this.flags.set(f, v);
	}
	
	getFlag(f) {
		return this.flags.get(f);
	}

	exportVMContext() {
		let result = {};
		for (let each of this.vars.entries()) {
			result[each[0]] = each[1];
		}
		return vm.createContext(result);
	}
	
	
}

module.exports = Context;