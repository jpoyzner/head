import WSModel from '../models/wsmodel';
import $ from 'jquery';

export default class Session extends WSModel {
	//TODO: the session class needs to be initialized (constructor) from cookies if exist
	//if not, then it should have some state that the react component can read and force login
	
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
			if (!data) { //logout returns null from WS
				callback(data);
			}
		});
	}
	
	getPermission(objectType) {
		//TODO: implement
		return null;
	}
}