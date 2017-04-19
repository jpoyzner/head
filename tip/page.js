define(['react', 'components/billingpolicywizard', 'components/cmdhpolicywizard',
	'components/scapolicywizard', 'components/loadshedchart', 'components/devicecommentcolumn',
	'components/devicemapdash', 'components/zendeskwidget', 'components/reportnavigation',
	'components/powerqualitychart', 'components/topologytoggle', 'components/intervaldatachart',
	'components/provisioningsettings', 'components/serviceoffrecurringsettings'],
function(React, BillingPolicyWizard, CMDHPolicyWizard, SCAPolicyWizard, LoadShedChart,
		DeviceCommentColumn, DeviceMapDash, ZDWidget, ReportNavigation, PowerQualityChart,
		TopologyToggle, IntervalDataChart, ProvisioningSettings, ServiceOffRecurringSettings) {
	
	return React.createClass({
		getInitialState: function() {
			return this.props;
		},
		render: function() {
			return (
				<div className="gn-react-page">
					{this.props.showBillingPolicyWizard ? <BillingPolicyWizard /> : ''}
					{this.props.showCMDHPolicyWizard ? <CMDHPolicyWizard /> : ''}
					{this.props.showSCAPolicyWizard ? <SCAPolicyWizard /> : ''}
					{this.props.showServiceOffRecurringSettings ? <ServiceOffRecurringSettings /> : ''}
					{this.props.showLoadShedChart ? <LoadShedChart /> : ''}							
					{this.props.showDeviceCommentColumn ? <DeviceCommentColumn /> : ''}
					{this.props.showTopologyToggle ? <TopologyToggle /> : ''}
					{this.props.showDevicemap ?
						<DeviceMapDash params={this.state.params} reload={this.state.reload} />
						: ''}
					{this.props.showReportNavigation ? <ReportNavigation /> : ''}
					{this.props.showPowerQualityChart ? <PowerQualityChart /> : ''}
					{this.props.showIntervalDataChart ? <IntervalDataChart compact={this.state.compact} />: ''}
					{this.props.showProvisioningSettings ? <ProvisioningSettings />: ''}
					{useZendeskWidget ? <ZDWidget/> : ''}
					<div id="gn-react-page-veil" />
				</div>
			);
		}
	});
});
