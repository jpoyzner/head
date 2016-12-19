define(['react', 'models/loadshed', 'jquery', 'moment'], function(React, LoadShed, $, Moment) {
	return React.createClass({
		getInitialState: function() {			
			if ($('#policy_type').attr('value') === 'pan-dred-control') {
				new LoadShed($('#policy_id').attr('value')).on('sync', function(data) {
					this.setState({data: data.models[0], loaded: true});
				}.bind(this));
			}

			return {};
		},
		render: function() {			
			if (!this.state.loaded) {
				return <div id="gn-load-shed-chart" />;
			}

			var margin = {top: 10, right: 0, bottom: 160, left: 60};
			var width = 700 - margin.left - margin.right;
	        var height = 500 - margin.top - margin.bottom;
	        
	        var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
	        
	        x.domain(
	        	this.state.data.get('demandDataPoints').map(
	        		function(point) {
			        	return point.date;
			        }));

	        this.xAxis =
	        	d3.svg.axis()
	        		.scale(x)
	        		.orient("bottom")
	        		.tickSize(0)
	        		.tickFormat(function(date) {
			        	return Moment(date).format('H:mm');
					});

	        var y = d3.scale.linear().range([height, 0]);
	        this.yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
	        
	        var domainMax =
	        	d3.max(
	        		this.state.data.get('demandDataPoints'),
	        		function(point) {
	        			return point.y;
	        		});

	        y.domain([0, domainMax * 1.1]);

			var barWidth = x.rangeBand();

		    return (
				<div id="gn-load-shed-chart">
					<div id="gn-load-shed-chart-header">
						<span><b>{GN.Lang.actualLoadShed}</b></span>
					</div>
					<div id="gn-load-shed-chart-body">
						<div>
							<svg id="gn-chart-svg"
								height={height + margin.top + margin.bottom}
								width={width + margin.left + margin.right}>
								
								<g transform=
									{'translate(' + margin.left + ',' + margin.top + ')'}>
									
									{this.state.data.get('demandDataPoints').map(
										function(point, index) {
											return (
												<rect key={index}
													className="bar"
													height={(height - y(point.y)) || 1}
													width={barWidth}
													x={x(point.date)}
													y={y(point.y)}
													data-value={point.y}/>
											);
										})}

									<g className="x axis"
										transform={"translate(0," + (height - 7) + ")"} />

									<g className="y axis">
										<text dx="58px" dy="-15px">
											{GN.Lang.actualDemand + ' (kW)'}
										</text>
									</g>
								</g>
							</svg>
						</div>
					</div>
					<div id="gn-load-shed-values">
						<div>
							<b>
								{GN.Lang.devicesFailed + ": "
									+ this.state.data.get('dredFailedToShedCount')}
							</b>
						</div>
						<div>
							<b>
								{GN.Lang.totalLoadShed + ": "
									+ this.state.data.get('totalLoadShed') + "kVA"}								
							</b>
						</div>
						<div>
							<b>
								{GN.Lang.maxLoadShed + ": "
									+ this.state.data.get('peakLoadShed') + "kVA"}
							</b>
						</div>
						<div>
							<b>
								{GN.Lang.maxDemand + ": "
									+ this.state.data.get('maxDemand') + "kW"}
							</b>
						</div>
						<div>
							<b>
								{GN.Lang.servicePointsReporting + ": "
									+ this.state.data.get('targetReportingPercent') + "%"}
							</b>
						</div>
					</div>
					<div id="gn-bar-value"></div>
				</div>
			);
		},
		componentDidUpdate: function() {
	      	this.xAxis(d3.selectAll('.x.axis'));
			
			$('.x.axis text')
				.attr("dx", "-1em")
				.attr("dy", "1em")
				.attr("transform", "rotate(-50)");

			this.yAxis(d3.selectAll('.y.axis'));

			var barValue = $('#gn-bar-value');			
			$('rect').mousemove(function(e) {
		    	var bar = $(e.target);	    		
	    		barValue.html(bar.data('value') + 'kW');

	    		var cssOptions =
	    			{left:
	    				bar.offset().left + bar.attr('width') / 2 - barValue.width() / 2 - 8,
	    			top: e.clientY - 40};
	    		
	    		barValue.css(cssOptions).show();

	    		$($('.x.axis .tick')[bar.index()]).find('text').css('font-weight', 'bold');
		    }).mouseleave(function(e) {
		    	barValue.hide();
		    	$('.x.axis .tick text').css('font-weight', 'normal');
			});
		}
	});
});