const 
	Std       = require('./modules.json');

class StdLoader {
	constructor(opts) {
		if (!opts) opts = {};
		
		this.context = opts.context;
		
		for (let module of Std.modules) {
			try {
				let lib = require(`./modules/${module}`);
				this.context.setVar(module, lib);
			} catch (e) {
				throw e;
			}
		}
	}
}

module.exports = StdLoader;