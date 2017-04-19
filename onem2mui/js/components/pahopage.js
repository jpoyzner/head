import React from 'react';
import $ from 'jquery';
import PahoClient from '../models/pahoclient';

const topic = 'World';

class PahoPage extends React.Component {
	constructor(props) {
		super();
		
		PahoClient.connect(topic);
		
		PahoClient.setReceiveCallback((message) => {
			this.setState({msg: message.payloadString});
		});
		
		this.state =  {msg: ''};
	}
	
    render() {
        return (
		    <div id="gn-page-content">
		    	<input id="gn-send" />
		    	<button onClick={this.send}>SEND MESSAGE</button>
		    	<br />
		    	<br />
		    	<span>Recieved message:  </span>
		    	<input id="gn-receive" value={this.state.msg} />
		    </div>
        );
    }
    
    send() {
		PahoClient.send(topic, $('#gn-send').val());    	
    }
});