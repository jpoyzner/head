import React from 'react';
import Session from '../models/session';
import Dashboard from '../components/dashboard';
import Login from '../components/login';

class Page extends React.Component {
	constructor(props) {
		super();
		this.session = new Session();
		this.state = props;
	}

	getChildContext() {
	    return {session: this.session};
	}
	
	render() {
		if (!this.session.exists()) {
			return (
				<div className="gn-react-page">
					<Login page={this} />
					<i className="fa fa-cog" aria-hidden="true"></i>
				</div>
			);
		}
		
		return (
			<div className="gn-react-page">
				{this.state.showDashboard ? <Dashboard /> : ""}
				<a id="gn-logout" onClick={this.logout.bind(this)}><b>Logout</b></a>
				<i className="fa fa-cog" aria-hidden="true"></i>
				<div id="gn-react-page-veil" />
			</div>
		);
	}
	
	logout() {
		this.session.logout(function() {
			this.setState({});
		}.bind(this));
	}
}

Page.childContextTypes = {session: React.PropTypes.object}

export default Page;
