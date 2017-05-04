import Tab from './tab';
import Tabs from './tabs';

export default class DredMetersTab extends Tab {
	get HEADING() {
		return 'Demand Response';
	}
	
	open() {
		return this.tabs.elements().click("*=Demand Response");
	}
	
	getHeading() {
		return browser.getText('#tab_dashboard_4 h2');
	}
	
	getLabelSelector() {
		return '#tab-dreds';
	}
	
	getTabBodySelector() {
		return "#tab_dashboard_4";
	}
}