define(['react', 'models/powerquality', 'jquery'], function(React, PowerQuality, $) {
	return React.createClass({
		getInitialState: function() {
			GN.powerQualityChart = this;
			this.model = new PowerQuality();
			
			this.model.on('sync', function(data) {
				this.hoversAdded = false;	
				this.setState({data: data.models[0], loading: false});
			}.bind(this));			

			return {
				loading: true,
				voltageA: true,
				voltageB: true,
				voltageC: true,
				currentA: true,
				currentB: true,
				currentC: true,
				powerFactorA: true,
				powerFactorB: true,
				powerFactorC: true,
			};
		},
		render: function() {
			$('#pw-quality-profile-table-chart table').remove();

			if (this.state.loading) {
				$('.ajax-loading').show();

				return (
					<div id="gn-power-quality-chart">
						<div id="gn-power-quality-chart-header">
							<span><b>{GN.Lang.pqChart}</b></span>
						</div>
						<div id="gn-power-quality-chart-body">
							<div id="gn-power-quality-no-data">
								<span className="ajax-loading">{' '}</span>
							</div>
						</div>
					</div>
				);
			}

			var ticks = 15;
			var tickFormat = "%d/%m %H:%M";
			var pointDistance = 60000; //one minute
			switch(this.state.data.get('aggregateType')) {
				case 'Hour':  pointDistance *= 60; break;
				case 'HalfHour':  pointDistance *= 30; break;
				case 'QuarterHour': pointDistance *= 15; break;
				default: tickFormat = "%H:%M"; ticks = 24;	
			}

			var margin = {top: 30, right: 150, bottom: 30, left: 50};
			var width = 1050 - margin.left - margin.right;
			var height = 350 - margin.top - margin.bottom;

			var x = d3.time.scale().range([0, width]);
			this.x = x;
			var y0 = d3.scale.linear().range([height, 0]);
			this.y0 = y0;
			var y1 = d3.scale.linear().range([height, 0]);
			this.y1 = y1;
			var y2 = d3.scale.linear().range([height, 0]);
			this.y2 = y2;

			this.xAxis =
				d3.svg.axis()
					.scale(x)
					.orient("bottom")
					.ticks(ticks)
					.tickFormat(d3.time.format(tickFormat));
			
			var yTicks = 10;
			this.yAxisLeft = d3.svg.axis().scale(y0).orient("left").ticks(yTicks);
			this.yAxisRight = d3.svg.axis().scale(y1).orient("right").ticks(yTicks);
			this.yAxisRight2 = d3.svg.axis().scale(y2).orient("right").ticks(yTicks); 

			var valueline = //PHASE A voltage
				d3.svg.line()
			    	.x(function(point) {
			    		return x(point.date);
			    	})
			    	.y(function(point) {
			    		return y0(point.y);
			    	}).defined(function(point) {
			    		return point.y;
			    	});
			    
			var valueline2 = //PHASE A voltage
				d3.svg.line()
				    .x(function(point) {
				    	return x(point.date);
				    })
				    .y(function(point) {
				    	return y1(point.a);
				    }).defined(function(point) {
			    		return point.a;
			    	});

			var valueline3 = //PHASE A power factor
				d3.svg.line()
				    .x(function(point) {
				    	return x(point.date);
				    })
				    .y(function(point) {
				    	return y2(point.z);
				    }).defined(function(point) {
			    		return point.z;
			    	});

			var valueline4 = //PHASE B voltage
				d3.svg.line()
			    	.x(function(point) {
			    		return x(point.date);
			    	})
			    	.y(function(point) {
			    		return y0(point.y2);
			    	}).defined(function(point) {
			    		return point.y2;
			    	});
			    
			var valueline5 = //PHASE B current
				d3.svg.line()
				    .x(function(point) {
				    	return x(point.date);
				    })
				    .y(function(point) {
				    	return y1(point.a2);
				    }).defined(function(point) {
			    		return point.a2;
			    	});

			var valueline6 = //PHASE B power factor
				d3.svg.line()
				    .x(function(point) {
				    	return x(point.date);
				    })
				    .y(function(point) {
				    	return y2(point.z2);
				    }).defined(function(point) {
			    		return point.z2;
			    	});

			var valueline7 = //PHASE C voltage
				d3.svg.line()
			    	.x(function(point) {
			    		return x(point.date);
			    	})
			    	.y(function(point) {
			    		return y0(point.y3);
			    	}).defined(function(point) {
			    		return point.y3;
			    	});
			    
			var valueline8 = //PHASE C current
				d3.svg.line()
				    .x(function(point) {
				    	return x(point.date);
				    })
				    .y(function(point) {
				    	return y1(point.a3);
				    }).defined(function(point) {
			    		return point.a3;
			    	});

			var valueline9 = //PHASE C power factor
				d3.svg.line()
				    .x(function(point) {
				    	return x(point.date);
				    })
				    .y(function(point) {
				    	return y2(point.z3);
				    }).defined(function(point) {
			    		return point.z3;
			    	});

			var graph = this.state.data.get('graph');
			if (graph) {
				for (var i = 0; i < graph.length; i++) {
					var point = graph[i]
				    var nextIndex = i + 1;
				    var nextPoint = graph[nextIndex];
					if (nextPoint) {
						if (nextPoint.date - point.date !== pointDistance) {
							//console.log("FIXING POINT " + i);

							graph.splice(
								nextIndex,
								0,
								{date: new Date(Number(point.date) + pointDistance)});
						}
					}
				}
			}

			this.graph = graph;

		    x.domain(
		    	d3.extent(
		    		graph,
		    		function(point) {
		    			return point.date;
		    		}));

		    y0.domain(this.getDomain(graph, 'y', 'y2', 'y3'));
		    y1.domain(this.getDomain(graph, 'a', 'a2', 'a3'));
		    y2.domain(this.getDomain(graph, 'z', 'z2', 'z3'));

		    var legendLineLength = 20;

		    return (
				<div id="gn-power-quality-chart">
					<div id="gn-power-quality-chart-header">
						<span><b>{GN.Lang.pqChart}</b></span>
					</div>
					<div id="gn-power-quality-chart-body">
						{graph && graph.length ?
							<div>
								<svg id="gn-chart-svg"
									height={height + margin.top + margin.bottom + 60}
									width={width + margin.left + margin.right + 20}>
									
									<g transform=
										{'translate('
											+ (margin.left + 40) + ','
											+ margin.top + ')'}>
										
										<path className="gn-path-voltage gn-first"
											style={{
												display:
													this.state.voltageA ? 'block' : 'none'}}
											d={valueline(graph)} />
										
										<path className="gn-path-current gn-first"
											style={{
												display:
													this.state.currentA ? 'block' : 'none'}}
											d={valueline2(graph)} />
									
										<path className="gn-path-power-factor gn-first"
											style={{
												display:
													this.state.powerFactorA ? 'block' : 'none'}}
											d={valueline3(graph)} />

										<path className="gn-path-voltage gn-second"
											style={{
												display:
													this.state.voltageB ? 'block' : 'none'}}
											d={valueline4(graph)} />
									
										<path className="gn-path-current gn-second"
											style={{
												display:
													this.state.currentB ? 'block' : 'none'}}
											d={valueline5(graph)} />
									
										<path className="gn-path-power-factor gn-second"
											style={{
												display:
													this.state.powerFactorB ? 'block' : 'none'}}
											d={valueline6(graph)} />

										<path className="gn-path-voltage gn-third"
											style={{
												display:
													this.state.voltageC ? 'block' : 'none'}}
											d={valueline7(graph)} />
									
										<path className="gn-path-current gn-third"
											style={{
												display:
													this.state.currentC ? 'block' : 'none'}}
											d={valueline8(graph)} />
									
										<path className="gn-path-power-factor gn-third"
											style={{
												display:
													this.state.powerFactorC ? 'block' : 'none'}}
											d={valueline9(graph)} />

										<g className="x axis"
											transform={'translate(0,' + height + ')'} />
										
										{this.state.voltageA
											|| this.state.voltageB
											|| this.state.voltageC ?
										
											<g className="y axis yaxis1">
												<text className="gn-uom" dx="-30px" dy="-15px">
													{GN.Lang.volts}
												</text>
											</g>
											: ""}
										
										{this.state.currentA
											|| this.state.currentB
											|| this.state.currentC ?
										
											<g className="y axis yaxis2"
													transform={'translate(' + width + ',0)'}>

												<text className="gn-uom" dy="-15px">
													{GN.Lang.amps}
												</text>
											</g>
											: ""}

										{this.state.powerFactorA
											|| this.state.powerFactorB
											|| this.state.powerFactorC ?

											<g className="y axis yaxis3"
													transform=
														{'translate(' + (width + 50) + ',0)'}>

												<text className="gn-uom" dy="-15px">
													{GN.Lang.powerFactor}
												</text>
											</g>
											: ""}
									</g>
								</svg>
								<div id="gn-chart-voltage-bands">
									<div id="firstband" />
									<div id="secondband" />
								</div>
								<div id="gn-chart-toggles">
									<input type="checkbox"
										onChange={this.clickVoltageA}
										checked={this.state.voltageA} />
									
									<svg>
										<line className="gn-path-voltage"
											x2={legendLineLength} />
									</svg>

									<span onClick={this.clickVoltageA}>
										{GN.Lang.voltage + " A"}
									</span>

									<input type="checkbox"
										onChange={this.clickVoltageB}
										checked={this.state.voltageB} />
									
									<svg>
										<line className="gn-path-voltage gn-second"
											x2={legendLineLength} />
									</svg>

									<span onClick={this.clickVoltageB}>
										{GN.Lang.voltage + " B"}
									</span>

									<input type="checkbox"
										onChange={this.clickVoltageC}
										checked={this.state.voltageC} />
									
									<svg>
										<line className="gn-path-voltage gn-third"
											x2={legendLineLength} />
									</svg>

									<span onClick={this.clickVoltageC}>
										{GN.Lang.voltage + " C"}
									</span>

									<input type="checkbox"
										onChange={this.clickCurrentA}
										checked={this.state.currentA} />
									
									<svg>
										<line className="gn-path-current"
											x2={legendLineLength} />
									</svg>

									<span onClick={this.clickCurrentA}>
										{GN.Lang.current + " A"}
									</span>

									<input type="checkbox"
										onChange={this.clickCurrentB}
										checked={this.state.currentB} />
									
									<svg>
										<line className="gn-path-current gn-second"
											x2={legendLineLength} />
									</svg>

									<span onClick={this.clickCurrentB}>
										{GN.Lang.current + " B"}
									</span>

									<input type="checkbox"
										onChange={this.clickCurrentC}
										checked={this.state.currentC} />
									
									<svg>
										<line className="gn-path-current gn-third"
											x2={legendLineLength} />
									</svg>

									<span onClick={this.clickCurrentC}>
										{GN.Lang.current + " C"}
									</span>

									<input type="checkbox"
										onChange={this.clickPowerFactorA}
										checked={this.state.powerFactorA} />
									
									<svg>
										<line className="gn-path-power-factor"
											x2={legendLineLength} />
									</svg>

									<span onClick={this.clickPowerFactorA}>
										{GN.Lang.powerFactor + " A"}
									</span>

									<input type="checkbox"
										onChange={this.clickPowerFactorB}
										checked={this.state.powerFactorB} />
									
									<svg>
										<line className="gn-path-power-factor gn-second"
											x2={legendLineLength} />
									</svg>

									<span onClick={this.clickPowerFactorB}>
										{GN.Lang.powerFactor + " B"}
									</span>

									<input type="checkbox"
										onChange={this.clickPowerFactorC}
										checked={this.state.powerFactorC} />
									
									<svg>
										<line className="gn-path-power-factor gn-third"
											x2={legendLineLength} />
									</svg>

									<span onClick={this.clickPowerFactorC}>
										{GN.Lang.powerFactor + " C"}
									</span>
								</div>
							</div>
							: <div id="gn-power-quality-no-data">
								{GN.Lang.noData}
							</div>}
					</div>
					<div id="gn-pq-hover" />
				</div>
			);
		},
		componentDidUpdate: function() {
			if (!this.state.loading) {
				this.xAxis(d3.selectAll('.x.axis'));
				this.yAxisLeft(d3.selectAll('.yaxis1'));
				this.yAxisRight(d3.selectAll('.yaxis2'));
				this.yAxisRight2(d3.selectAll('.yaxis3'));

				$('g .x.axis g text').each(function(index) {
					var label = $(this);
				    var labelParts = label.html().split(' ');
				    label.html('');
				    
				    if (index % 2) {
				    	return;
				    }

				    var d3Element = d3.select(this);
				    d3Element.append('tspan').text(labelParts[0]);
				    
				    if (labelParts[1]) {
				    	  d3Element.append('tspan')
				    	  	.text(labelParts[1])
				    	  	.attr('x', 0)
				    	  	.attr('dy', '15');
				   	}
				});

				if (!this.hoversAdded) {
					var hoverModal = $('#gn-pq-hover');
					var timeFormat = d3.time.format("%d/%m %H:%M");
					this.hoverPoints = {};

				   	this.addHovers('voltageA', hoverModal, timeFormat, this.y0, 'y', GN.Lang.volts, '.gn-path-voltage.gn-first');
				   	this.addHovers('currentA', hoverModal, timeFormat, this.y1, 'a', GN.Lang.amps, '.gn-path-current.gn-first');
				   	this.addHovers('powerFactorA', hoverModal, timeFormat, this.y2, 'z', GN.Lang.powerFactor, '.gn-path-power-factor.gn-first');
				   	this.addHovers('voltageB', hoverModal, timeFormat, this.y0, 'y2', GN.Lang.volts, '.gn-path-voltage.gn-second');
				   	this.addHovers('currentB', hoverModal, timeFormat, this.y1, 'a2', GN.Lang.amps, '.gn-path-current.gn-second');
				   	this.addHovers('powerFactorB', hoverModal, timeFormat, this.y2, 'z2', GN.Lang.powerFactor, '.gn-path-power-factor.gn-second');
				   	this.addHovers('voltageC', hoverModal, timeFormat, this.y0, 'y3', GN.Lang.volts, '.gn-path-voltage.gn-third');
				   	this.addHovers('currentC', hoverModal, timeFormat, this.y1, 'a3', GN.Lang.amps, '.gn-path-current.gn-third');
				   	this.addHovers('powerFactorC', hoverModal, timeFormat, this.y2, 'z3', GN.Lang.powerFactor, '.gn-path-power-factor.gn-third');

				    this.hoversAdded = true;
				}
			}
		},
		addHovers: function(toggle, hoverModal, timeFormat, scale, unit, unitCaption, pathSelector) {
			//The circles aren't actually necessary but make a nice landing spot for mouse

			d3.select('svg g')
		   		.selectAll('dot')
		   		.data(this.graph)
		    	.enter()
		    	.append("circle")
		    	.attr("class", unit)								
		        .attr("r", 5)		
		        .attr("cx", function(d) {
	        		return this.x(d.date);
	        	}.bind(this)) 
		        .attr("cy", function(d) {
		        	return scale(d[unit]);
		        })
		        .on("mouseover", function(d) {		
		           if (this.state[toggle]) {
		           		this.drawTooltip(d, timeFormat, unitCaption, unit, hoverModal);
		           }
		        }.bind(this))					
		        .on("mouseout", function() {		
		           hoverModal.hide();
		        });

		        d3.selectAll('circle').each(function(d) {
		        	var index = parseInt(this.x(d.date));
		        	if (!this.hoverPoints[index]) {
		        		this.hoverPoints[index] = d;
		        	}		   			        
			    }.bind(this));

		        var component = this;
			    d3.select('path' + pathSelector)
				    .on("mouseover", function() {
				    	var d;
				    	var mousePosition = d3.mouse(this)[0];
				    	while((typeof d === 'undefined' || d === null) && mousePosition > -1) {
				    		d = component.hoverPoints[mousePosition--];
				    	}

			          	component.drawTooltip(d, timeFormat, unitCaption, unit, hoverModal);
			        })
				    .on("mouseout", function(d) {
				    	hoverModal.hide();
				    });
		},
		drawTooltip: function(d, timeFormat, unitCaption, unit, hoverModal) {
			var html =
           		'<p><b>' + timeFormat(d.date) + '</b></p>' +
    			'<p><b>' + unitCaption + ': ' + d[unit] + '</b></p>';

           	hoverModal.html(html)
           		.css({
           			display: 'inline-block',
    				left: d3.event.pageX - 65,
    				top: d3.event.pageY - 635})
		},
		getDomain: function(graph, key1, key2, key3) {
			var min =
				d3.min(
		    		graph,
		    		function(point) {
		    			return Math.min.apply(
							Math,
							[point[key1], point[key2], point[key3]].filter(function(value) {
								return value !== null;
							}));
					});

		    var max =
		    	d3.max(
		    		graph,
		    		function(point) {
						return Math.max(point[key1], point[key2], point[key3]);
					});

		    var padding = (max - min) / 10;
		    return [min - padding, max + padding];
		},
		clickVoltageA: function() {
			this.setState({voltageA: !this.state.voltageA});
			$('circle.y').toggle(!this.state.voltageA);
		},
		clickVoltageB: function() {
			this.setState({voltageB: !this.state.voltageB});
			$('circle.y2').toggle(!this.state.voltageB);
		},
		clickVoltageC: function() {
			this.setState({voltageC: !this.state.voltageC});
			$('circle.y3').toggle(!this.state.voltageC);
		},
		clickCurrentA: function() {
			this.setState({currentA: !this.state.currentA});
			$('circle.a').toggle(!this.state.currentA);
		},
		clickCurrentB: function() {
			this.setState({currentB: !this.state.currentB});
			$('circle.a2').toggle(!this.state.currentB);
		},
		clickCurrentC: function() {
			this.setState({currentC: !this.state.currentC});
			$('circle.a3').toggle(!this.state.currentC);
		},
		clickPowerFactorA: function() {
			this.setState({powerFactorA: !this.state.powerFactorA});
			$('circle.z').toggle(!this.state.powerFactorA);
		},
		clickPowerFactorB: function() {
			this.setState({powerFactorB: !this.state.powerFactorB});
			$('circle.z2').toggle(!this.state.powerFactorB);
		},
		clickPowerFactorC: function() {
			this.setState({powerFactorC: !this.state.powerFactorC});
			$('circle.z3').toggle(!this.state.powerFactorC);
		},
	});
});