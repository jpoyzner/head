import Tab from './tab';
import Tabs from './tabs';

export default class ElectricMetersTab extends Tab {
	get HEADING() {
		return 'Electric Meters';
	}
	
	open() {
		return this.tabs.elements().click("*=Electric Meters");
	}
	
	getHeading() {
		return browser.getText('#tab_dashboard_1 h2');
	}
	
	getLabelSelector() {
		return '#tab-smart-meters';
	}
	
	getTabBodySelector() {
		return "#tab_dashboard_1";
	}
}