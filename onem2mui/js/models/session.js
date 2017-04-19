import WSModel from '../models/wsmodel';
import $ from 'jquery';

export default class Session extends WSModel {
	constructor(page) {
		super(page);
	}
	
	login(username, password, callback) {
		super.callWS('login', {attributes: {username: username, password: password}}, (data) => {
			if (!data.error) {
				this.scopes = data.Permissions; //TODO: these should be stored by objectType
			}

			callback(data);
		});
	}
	
	exists() {
		return document.cookie.match(/(.*;)?session=[^;]+(.*)?/);
	}
	
	logout(callback) {
		super.callWS('logout', {}, (data) => {
			callback(data);
		});
	}
	
	getPermission(objectType) {
		//TODO: implement
		return null;
	}
}