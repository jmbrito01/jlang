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

module.exports = {
	log
};