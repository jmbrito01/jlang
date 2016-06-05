function itself() {
	return this;
}

class Scope {
	constructor(tb, parent) {
		this.symbol_table = tb;
		this.defines = {};
		this.parent = parent;
	}

	define (token) {
		let def = this.defines[token.value];
		if (typeof def === 'object') {
			token.error(def.reserved ? 'Already reserved.' : 'Aready defined.');
		}
		this.defines[token.value] = token;
		token.reserved = false;
		token.nud = function () {
			return this;
		}
		token.led = null;
		token.std = null;
		token.lbp = 0;
		//token.scope = scope;
		return token;
	}

	find (n) {
		let curScope = this;
		while (true) {
			let define = curScope.defines[n];
			if (define && typeof define !== 'function') return curScope.defines[n];
			if (!curScope.parent) {
				define = this.symbol_table[n];
				return define && typeof o !== 'function' ? define : curScope.symbol_table['(word)'];
			}
			curScope = curScope.parent;
		}
	}
	
	pop() {
		if (this.parent) return this.parent;
		else return null;
	}
	
	reserve(n) {
		if (n.arity !== 'name' || n.reserved) return;
		let define = this.defines[n.value];
		if (define) {
			if (define.reserved) return;
			if (define.arity === 'name') define.error('Already defined');
			
			this.defines[n.value] = n;
			n.reserved = true;
		}
	}
	
	static create(cur) {
		if (cur instanceof Scope) {
			let scope = new Scope(cur.symbol_table, cur);
			return scope;
		} else if (typeof cur === 'object') {
			let symbol_table = cur;
			let scope = new Scope(symbol_table, null);
			return scope;
		} else {
			throw "INVALID SCOPE PARAMETER";
		}
		
	}
};

module.exports = Scope;