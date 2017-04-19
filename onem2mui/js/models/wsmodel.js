import $ from 'jquery';

export default class WSModel {
	constructor(page) {
		this.page = page;
	}
	
	callWS(wsMethod, body, callback) {
		this.page.spin();
		$.post("ws/" + wsMethod, {data: JSON.stringify(body)}, (data) => {
			this.page.stopSpin();
			data = JSON.parse(data);
			if (data && data.error) {
				console.log(data.error);
				
				if (data.exceptionCode === 30) {
					this.page.setState({});
				}
			}
			
			callback(data);
		});
	}
}