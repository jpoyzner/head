define(['react', 'reactdom', 'components/page', 'utils/buildurl', 'backbone'],
function(React, ReactDOM, Page, BuildURL) {
	return new (Backbone.Router.extend({
		initialize: function() {
			var usePushStates = "pushState" in history;
			Backbone.history.start({pushState: usePushStates, hashChange: usePushStates});
		},
		routes: {
			'gn/policynet/report-maps': 'maps',
			'gn/policynet/policies/create/billing-read': 'billingPolicyWizard',
			'gn/policynet/policies/create/cmdh': 'cmdhPolicyWizard',			
			'gn/policynet/policies/create/sca': 'scaPolicyWizard',
			'gn/policynet/policies/create/service-power-off': 'serviceOffRecurringSettings',
			'gn/policynet/policies/edit/*policyId': 'editPolicy',
			'gn/policynet/policies/detail/*policy': 'loadShedChart',
			'gn/policynet/devices/detail/*device': 'deviceComponents',
			'gn/policynet/reports/report-pw-quality-profile/*device': 'powerQualityChart',
			'gn/policynet/reports/report-itvl-read/*device': 'intervalDataChart',
			'gn/policynet/system-settings/provisioning-settings': 'provisioningSettings',
			'*allOtherPages': 'render'
		},
		maps: function() {
			this.render({
				showDevicemap: true,
				params:
					this.parseQueryParams([
						'deviceType',
						'view',
						'substation',
						'feeder',
						'district',
						'watermain',
						'group',
						'customerType',
						'customerSize',
						'billingCycle',
						'plannedOutages',
						'unplannedOutages',
						'timeRange',
						'beginDate',
						'endDate',
						'events'])});
		},
		billingPolicyWizard: function() {
			this.render({showBillingPolicyWizard: true}, '#policy-content');
		},
		cmdhPolicyWizard: function() {
			this.render({showCMDHPolicyWizard: true}, '#policy-content');
		},
		scaPolicyWizard: function() {
			this.render({showSCAPolicyWizard: true}, '#policy-content');
		},
		serviceOffRecurringSettings: function() {
			this.render({
				showServiceOffRecurringSettings: true},
				'#gn-service-off-recurring-settings');
		},
		editPolicy: function() {
			var showPolicyKey = {};
			switch($('#policy_type').val()) {
				case 'cmdh': showPolicyKey = 'showCMDHPolicyWizard'; break;
				case 'sca': showPolicyKey = 'showSCAPolicyWizard'; break;
			}

			if (showPolicyKey) {
				var state = {};
				state[showPolicyKey] = true;
				this.render(state, '#policy-content');
			}
		},
		loadShedChart: function() {
			this.render({showLoadShedChart: false}, '#tab_policy_detail_6 .policy-layout-left');
		},
		deviceComponents: function(device) {
			this.renderComponents([
				{state: {showDeviceCommentColumn: true},
					parentElement: '#gn-device-comment-column-container'},
				{state: {showTopologyToggle: true},
					parentElement: '#tab_device_detail_1 .layout-container'},
				{state: {showReportNavigation: true},
					parentElement: '#gn-report-nav-container'},	
				{state: {showIntervalDataChart: true, compact: true},
					parentElement: '#itvl-read-table-container'},
				{state: {showPowerQualityChart: true},
					parentElement: '#pw-quality-profile-table-chart'}]);
		},
		powerQualityChart: function() {
			this.render({showPowerQualityChart: true}, '#pw-quality-profile-table-chart');
		},
		intervalDataChart: function() {
			this.render({showIntervalDataChart: true}, '#itvl-read-table-container');
		},
		provisioningSettings: function() {
			this.render(
				{showProvisioningSettings: true},
				'#tabs_provisioning .layout-container');
		},
		parseQueryParams: function(params) {	
			var queryParams = {};
			location.search.slice(1).split('&').forEach(function(entryString) {
				var entry = entryString.split('=');
				params.forEach(function(param) {
					if (entry[0] === param) {
						queryParams[param] = decodeURIComponent(entry[1]);
					}
				});
			});
			return queryParams;
		},
		render: function(state, parentElement) {
			if (typeof state === 'string') { //happens when called directly from routes()
				state = null;
				parentElement = null;
			}
			
			if (this.page) {
				this.page.setState($.extend(state, {reload: true}));
			} else {
				parentElement = $(parentElement || '.page-content');				
				if (!parentElement.length) {
					parentElement = $('.page-content');
				}

				if (!parentElement.length) {
					return;
				}
				
				this.page =
					ReactDOM.render(
						React.createElement(Page, state),
						$('<div class="gn-react-content"/>').prependTo(parentElement)[0]);
			}
		},
		renderComponents: function(components) {
			//use this function for multiple react components with custom parent elements
			//on the same page
			
			if (this.pages) {
				this.pages.forEach(function(page, index) {
					page.setState($.extend(component[index].state, {reload: true}));
				}.bind(this));
			} else {
				components.forEach(function(component, index) {
					this.pages = [];
					var parentElement = $(component.parentElement || '.page-content');
					if (!parentElement.length) {
						return;
					}
					
					this.pages.push(
						ReactDOM.render(
							React.createElement(Page, component.state),
							$('<div class="gn-react-content"/>').prependTo(
								component.parentElement)[0]));
				}.bind(this));
			}
		},
		navigateTo: function(URL, params) {
			var URL = BuildURL("gn/policynet/" + URL, params);
			if (URL === Backbone.history.fragment) {
				Backbone.history.loadUrl(URL);
			} else {
				this.navigate(URL, {trigger: true});
			}
		},
		redirectTo: function(path) {
			location.href = path;
		}
	}))();
});
