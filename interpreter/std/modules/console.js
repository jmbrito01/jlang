function log(type, txt) {
	let noType = false;
	if (txt === undefined) {
		txt = type;
		noType = true;
	}
	
	let text = "";
	if (!noType){
		//Has a log type
		text += `[ ${type} ] `;
		//TODO: Add colors to log types
	}
	
	text += txt;
	console.log(text);
}

function warn(txt) {
	log('WARNING', txt);
}

function error(txt) {
	log('ERROR', txt);
}

module.exports = {
	log, warn, error,
	__name: 'console'
};