class ModuleProperty {
	constructor(opts) {
		if (!opts) opts = {};
		
		this.module = opts.module;
		this.property = opts.property;
	}
	
	isFunction() {
		return typeof this.property === 'function';
	}
	
	call(args) {
		if (this.isFunction()) return this.property.apply(this.module,  args);
		else throw "CANNOT CALL PROPERTY";
	}
	
	value() {
		return this.property;
	}
}

module.exports = ModuleProperty;