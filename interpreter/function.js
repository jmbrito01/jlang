const
	vm		= require('vm');

class JFunction {
	constructor(fn, name) {
		if (fn instanceof Function) {
			// Direct javascript function
			this.name = name || fn.name;
			this.native = true;
			this.fn = fn;
		} else {
			// Uninterpreted function
			this.node = fn;
			this.native = false;
			this.name = this.node.value;
			this.params = this.node.first;
			this.body = this.node.second;
		}
	}

	isNative() {
		return this.native;
	}

	runNative(params) {
		//TODO: Separate the native execution vm with the interpreter vm for obvious security reasons
		return this.fn.apply(null, params);
	}
	
	prepareContext(context, params) {
		context.setVar('(this)', {
			__name: '(this)'
		});
		for (let i = 0;i < this.params.length;i++) {
			context.setVar(this.params[i].value, params[i]);
		}
	}
}

module.exports = JFunction;