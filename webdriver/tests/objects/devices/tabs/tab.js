export default class Tab {
	constructor(tabs) {
		this.tabs = tabs;
	}
	
	getCountFrom(text) {
		return Number(text.slice(1, text.length - 1));
	}
	
	getCountLabel() {
		return browser.getText(this.getLabelSelector() + " .ui-tabs-sublabel");
	}
	
	getOpStatePercents() {
		return browser.getText(this.getTabBodySelector() + " .vert-nav .devdash-ln-stat");
	}
}