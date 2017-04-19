import React from 'react';
import $ from 'jquery';

//TODO: this class should be using params and updating the URLs

export default class Dashboard extends React.Component {
	constructor() {
		super();
		this.state = {index: 0};
	}
	
	render() {
		return (
			<div id="gn-dashboard">
				<img id="gn-background" src="../../images/grid.jpg"></img>
				<div id="gn-dashboard-nav">
					<span><b>Devices</b></span>
					<span><b>Policies</b></span>
					<span><b>Events</b></span>
				</div>				
				<div id="gn-panel-slider">
					<div id="gn-devices-panel" className="gn-dashboard-panel">						
						<span>DEVICES STUFF</span>						
					</div>				
					<div id="gn-policies-panel" className="gn-dashboard-panel">
						<span>POLICIES STUFF</span>
					</div>			
					<div id="gn-events-panel" className="gn-dashboard-panel">
						<span>EVENTS STUFF</span>
					</div>
				</div>
				<i className="fa fa-arrow-left"
					onClick={this.navLeft.bind(this)}
					aria-hidden="true">
				</i>
				<i className="fa fa-arrow-right"
					onClick={this.navRight.bind(this)}
					aria-hidden="true">
				</i>
			</div>
		);
	}
	
	componentDidMount() {
		var navSpans = $('#gn-dashboard-nav span');
		var component = this;
		navSpans.click(function() {
			var selectedSpan = $(this);
			component.selectNavSpan(selectedSpan);						
			component.slideToIndex(selectedSpan.index());
		});
		
		this.selectNavSpan($(navSpans[this.state.index]));
		this.updateArrows(navSpans.length);
	}
	
	navLeft() {
		this.slideToIndex(this.state.index - 1);
	}
	
	navRight() {
		this.slideToIndex(this.state.index + 1);
	}
	
	slideToIndex(index) {
		this.selectNavSpan($($('#gn-dashboard-nav span')[index]));
		
		//be sure to update $number-of-panels in layout.scss for this to work:
		var slider = $('#gn-panel-slider');
		slider.animate({left: index * -100 + '%'}, 'slow');
		
		this.state.index = index;
		this.updateArrows(slider.children().length);
	}
	
	updateArrows(numberOfPanels) {
		$('.fa-arrow-left').toggle(this.state.index !== 0);
		$('.fa-arrow-right').toggle(this.state.index < numberOfPanels - 1);
	}	
	
	selectNavSpan(navSpan) {
		navSpan.siblings().removeClass('gn-is-selected');
		navSpan.addClass('gn-is-selected');
	}
}
