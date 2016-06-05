class Function {
	constructor(opts) {
		this.node = opts;
		
		this.name = this.node.value;
		this.params = this.node.first;
		this.body = this.node.second;
	}
	
	prepareContext(context, params) {
		for (let i = 0;i < this.params.length;i++) {
			context.setVar(this.params[i].value, params[i]);
		}
	}
}

module.exports = Function;