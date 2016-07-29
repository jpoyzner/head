import $ from 'jquery';

export default class WSModel {
	callWS(wsMethod, body, callback) {
		var gear = $('.fa-cog');
		gear.addClass('fa-spin').show();
		$.post("ws/" + wsMethod, {data: JSON.stringify(body)}, (data) => {
			gear.hide().removeClass('fa-spin');
			data = JSON.parse(data);
			if (data && data.error) {
				console.log(data.error);
			}
			
			callback(data);
		});
	}
}