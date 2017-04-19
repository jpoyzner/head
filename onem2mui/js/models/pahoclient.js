import Paho from '../lib/paho';

class PahoClient {
	constructor() {
		this.client = new Paho.MQTT.Client('localhost', 8080, "jpoyzner");
		
		this.client.onConnectionLost = (responseObject) => {
			if (responseObject.errorCode !== 0) {
			    console.log("onConnectionLost: " + responseObject.errorMessage);
			}
		};
	}
	
	connect(defaultTopic) {
		this.client.connect({
			useSSL: true,
			onSuccess: () => {
				console.log("connected");
				this.client.subscribe('/' + defaultTopic);
			}});
	}
	
	send(topic, message) {
    	var message = new Paho.MQTT.Message(message);
		message.destinationName = '/' + topic;		
		
		this.client.send(message)
	}
	
	setReceiveCallback(callback) {
		this.client.onMessageArrived = callback;
	}
}

export default new PahoClient();