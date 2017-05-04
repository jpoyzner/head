import ElectricMeterTab from './electricmeterstab';
import DredMeterTab from './dredmeterstab';

export default class Tabs {
	get SELECTOR() {
		return '#tabs_dashboard_list > *';
	}
	
	getCount() {
		return 6;
	}

	constructor() {
		this.electricTab = new ElectricMeterTab(this);
		this.dredTab = new DredMeterTab(this);
	}
	
	elements() {
		return browser.elements(this.SELECTOR)
	}
}