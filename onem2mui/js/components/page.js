import React from 'react';
import Session from '../models/session';
import Dashboard from '../components/dashboard';
import Login from '../components/login';
import $ from 'jquery';

class Page extends React.Component {
	constructor(props) {
		super();
		this.session = new Session(this);
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
	
	spin() {
		$('.fa-cog').addClass('fa-spin').show();
	}
	
	stopSpin() {
		$('.fa-cog').hide().removeClass('fa-spin');
	}
	
	logout() {
		this.session.logout(function() {
			this.setState({});
		}.bind(this));
	}
}

Page.childContextTypes = {session: React.PropTypes.object}

export default Page;
