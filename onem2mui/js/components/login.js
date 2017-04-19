import React from 'react';
import $ from 'jquery';

class Login extends React.Component {
	constructor() {
		super();
		this.state = {};
	}
	
	render() {
		return (
			<div className="gn-login">
				<img id="gn-background" src="../../images/grid.jpg"></img>
				<div id="gn-login-form">
					{this.state.error ?
						<div id="gn-login-error"><b>{this.state.error}</b></div>
						: ""}
					<div className="gn-login-input">
						<span>USERNAME:</span>
						<input id="gn-username"
							onKeyPress={this.keypress.bind(this)}
							placeholder="[enter username]" />
					</div>
					<div className="gn-login-input">
						<span>PASSWORD:</span>
						<input id="gn-password"
							onKeyPress={this.keypress.bind(this)}
							placeholder="[enter password]"
							type="password" />
					</div>
					<div className="button" onClick={this.login.bind(this)}>
						<span>LOGIN</span>
					</div>
				</div>
			</div>
		);
	}
		
	keypress(event) {
		if (event.which === 13) {
			this.login(event);
		}
	}
	
	login(event) {
		event.preventDefault();
		
		this.context.session.login($('#gn-username').val(), $('#gn-password').val(), (data) => {
			if (data.error) {
				this.setState({error: data.error.excpetionDescription || "Login failed"});
				return;
			}
			
			this.setState({error: false});
			this.props.page.setState({});
		});
	}
}

Login.contextTypes = {session: React.PropTypes.object};

export default Login
