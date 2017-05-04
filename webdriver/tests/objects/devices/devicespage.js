import Tabs from './tabs/tabs';

export default class DevicePage {
	static get TITLE() {
		return 'Company | Devices';
	}

	constructor() {
		this.tabs = new Tabs;
	}
}