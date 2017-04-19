define(['react', 'models/powerquality', 'jquery'], function(React, PowerQuality, $) {
	return React.createClass({
		getInitialState: function() {
			GN.powerQualityChart = this;
			this.model = new PowerQuality();
			
			var margin = {top: 30, right: 150, bottom: 30, left: 50};

			var width = 1050 - margin.left - margin.right;
			this.x = d3.time.scale().range([0, width]);			

			this.model.on('sync', function(data) {
				var data = data.models[0];
				
				this.graph = data.get('graph');
				
				this.showPhaseB = false;
				this.showPhaseC = false;
				if (this.graph && this.graph.length) {
					for (var i = 0; i < this.graph.length; i++) {
						if (this.graph[i].y2) {
							this.showPhaseB = true;
							break;
						}
					}

					for (var i = 0; i < this.graph.length; i++) {
						if (this.graph[i].y3) {
							this.showPhaseC = true;
							break;
						}
					}
				}
				
				this.phases = 1 + this.showPhaseB + this.showPhaseC;

				var ticks;
				var tickFormat;
				switch(data.get('aggregateType')) {
					case 'Hour': tickFormat = "%m/%d %H:%M"; ticks = 15; break;
					case 'HalfHour': tickFormat = "%m/%d %H:%M"; ticks = 15; break;
					case 'QuarterHour': tickFormat = "%m/%d %H:%M"; ticks = 15; break;
					default: tickFormat = "%H:%M"; ticks = 24;	
				}

				this.xAxis =
					d3.svg.axis()
						.scale(this.x)
						.orient("bottom")
						.ticks(ticks)
						.tickFormat(d3.time.format(tickFormat));

				var height =
					(this.phases === 1 ? 380 : (350 - (this.phases - 1) * 75))
					- margin.top
					- margin.bottom;
				
				this.y0 = d3.scale.linear().range([height, 0]);
				this.y1 = d3.scale.linear().range([height, 0]);
				this.y2 = d3.scale.linear().range([height, 0]);
				this.y0B = d3.scale.linear().range([height, 0]);
				this.y1B = d3.scale.linear().range([height, 0]);
				this.y2B = d3.scale.linear().range([height, 0]);
				this.y0C = d3.scale.linear().range([height, 0]);
				this.y1C = d3.scale.linear().range([height, 0]);
				this.y2C = d3.scale.linear().range([height, 0]);

				var yTicks = 10;
				
				this.yAxisLeft =
					d3.svg.axis()
						.scale(this.y0)
						.orient("left")
						.ticks(yTicks)
						.tickFormat(d3.format("d"));
				
				this.yAxisRight =
					d3.svg.axis()
						.scale(this.y1)
						.orient("right")
						.ticks(yTicks);
				
				this.yAxisRight2 =
					d3.svg.axis()
						.scale(this.y2)
						.orient("right")
						.ticks(yTicks);
				
				this.yAxisLeftB =
					d3.svg.axis()
						.scale(this.y0B)
						.orient("left")
						.ticks(yTicks)
						.tickFormat(d3.format("d"));
				
				this.yAxisRightB =
					d3.svg.axis()
						.scale(this.y1B)
						.orient("right")
						.ticks(yTicks);
				
				this.yAxisRight2B =
					d3.svg.axis()
						.scale(this.y2B)
						.orient("right")
						.ticks(yTicks);
				
				this.yAxisLeftC =
					d3.svg.axis()
						.scale(this.y0C)
						.orient("left")
						.ticks(yTicks)
						.tickFormat(d3.format("d"));
				
				this.yAxisRightC =
					d3.svg.axis()
						.scale(this.y1C)
						.orient("right")
						.ticks(yTicks);
				
				this.yAxisRight2C =
					d3.svg.axis()
						.scale(this.y2C)
						.orient("right")
						.ticks(yTicks);			

				this.x.domain(
			    	d3.extent(
			    		this.graph,
			    		function(point) {
			    			return point.date;
			    		}));

				var voltageDomain = this.getDomain(this.graph, 'y', null, null, 10);
				if (voltageDomain) {
					this.y0.domain(voltageDomain);
				}
			    
			    var currentDomain = this.getDomain(this.graph, 'a', null, null, 10);
			    if (currentDomain) {
			    	this.y1.domain(currentDomain);
			    }
			    
			    var powerFactorDomain = this.getDomain(this.graph, 'z', null, null, 10);
			    if (powerFactorDomain) {
			    	this.y2.domain(powerFactorDomain);
			    }

			    var voltageDomainB = this.getDomain(this.graph, null, 'y2', null, 10);
			    if (voltageDomainB) {
			    	this.y0B.domain(voltageDomainB);		    
			    }
			    
			    var currentDomainB = this.getDomain(this.graph, null, 'a2', null, 10);
			    if (currentDomainB) {
			    	this.y1B.domain(currentDomainB);
			    }
			    
			    var powerFactorDomainB = this.getDomain(this.graph, null, 'z2', null, 10);
			    if (powerFactorDomainB) {
			    	this.y2B.domain(powerFactorDomainB);
			    }

			    var voltageDomainC = this.getDomain(this.graph, null, null, 'y3', 10);
				if (voltageDomainC) {
					this.y0C.domain(voltageDomainC);
				}
			    
			    var currentDomainC = this.getDomain(this.graph, null, null, 'a3', 10);
			    if (currentDomainC) {
			    	this.y1C.domain(currentDomainC);
			    }
			    
			    var powerFactorDomainC = this.getDomain(this.graph, null, null, 'z3', 10);
			    if (powerFactorDomainC) {
			    	this.y2C.domain(powerFactorDomainC);
			    }

			    var voltageBandsets = data.get('bands');		    
		    	
		    	var voltageBands =
		    		voltageBandsets ?
		    			voltageBandsets[voltageBandsets[''] ? '' : 4].userValues
		    			: [{voltageMin: 0,
		    				voltageMax: 10000,
		    				color: 'black',
		    				bandName: GN.Lang.allBands}];

				var voltageADomain = this.getDomain(this.graph, 'y');
				if (!voltageADomain) {
					this.setState({loading: false, noResults: true});
					return;
				}			

				var gradients = [{
					id: 'gn-voltageAGrad',
					min: voltageADomain[0],
					height: voltageADomain[1] - voltageADomain[0]
				}];

				var voltageBDomain = this.getDomain(this.graph, 'y2');
				
				gradients.push(
					voltageBDomain ?
						{
							id: 'gn-voltageBGrad',
							min: voltageBDomain[0],
							height: voltageBDomain[1] - voltageBDomain[0]
						}
						: null);

				var voltageCDomain = this.getDomain(this.graph, 'y3');
				
				gradients.push(
					voltageCDomain ?
						{
							id: 'gn-voltageCGrad',
							min: voltageCDomain[0],
							height: voltageCDomain[1] - voltageCDomain[0]
						}
						: null);

				var linearGradients =
					gradients.map(function(gradient, index) {
						if (!gradient) {
							return null;
						}

						var ratio = 100 / gradient.height

						return (
							<linearGradient key={index}
								id={gradient.id}
								x2="0%" y1="100%">

								<stop key={0}
									stopColor={'black'}
									offset=
										{((voltageBands[0].voltageMin - gradient.min) * ratio)
										+ '%'} />

					            {voltageBands.map(function(band, index) {
									var minOffset =
										band.voltageMin - gradient.min;

									var maxOffset =
										band.voltageMax - gradient.min;

									return [
										<stop key={index * 2 + 1}
											stopColor={(band.color === 'black' ? '' : '#') + band.color}
											offset=
												{(minOffset * ratio) + '%'} />,												

										<stop key={index * 2 + 2}
											stopColor={(band.color === 'black' ? '' : '#') + band.color}
											offset=
												{(maxOffset * ratio) + '%'} />
									];
								})}

								<stop key={voltageBands.length * 2 + 1}
									stopColor={'black'}
									offset=
										{((voltageBands[voltageBands.length - 1].voltageMax
												- gradient.min)
											* ratio)
										+ '%'} />
				        	</linearGradient>
				        );
					});

				this.setState({
					loading: false,
					noResults: false,
					height: height,							
					currentDomain: currentDomain,
					powerFactorDomain: powerFactorDomain,
					currentDomainB: currentDomainB,
					powerFactorDomainB: powerFactorDomainB,
					currentDomainC: currentDomainC,
					powerFactorDomainC: powerFactorDomainC,
					linearGradients: linearGradients,
					path: this.pathFunction(this.y0, 'y')(this.graph),
					path2: this.pathFunction(this.y1, 'a')(this.graph),
					path3: this.pathFunction(this.y2, 'z')(this.graph),
					path4: this.pathFunction(this.y0B, 'y2')(this.graph),
					path5: this.pathFunction(this.y1B, 'a2')(this.graph),
					path6: this.pathFunction(this.y2B, 'z2')(this.graph),
					path7: this.pathFunction(this.y0C, 'y3')(this.graph),
					path8: this.pathFunction(this.y1C, 'a3')(this.graph),
					path9: this.pathFunction(this.y2C, 'z3')(this.graph),
					legendVoltageBands: voltageBands.slice(0).reverse(),
					hoversAdded: false
				});
			}.bind(this));			

			return {
				loading: true,
				voltageA: true,
				voltageB: true,
				voltageC: true,
				powerFactorA: true,
				powerFactorB: true,
				powerFactorC: true,
				margin: margin,
				width: width,				
				legendLineLength: 20,
			};
		},
		pathFunction: function(scale, unit) {
			return d3.svg.line()
		    	.x(function(point) {
		    		return this.x(point.date);
		    	}.bind(this))
		    	.y(function(point) {
		    		return scale(point[unit]);
		    	}.bind(this)).defined(function(point) {
		    		return point[unit] !== null;
		    	});
		},
		render: function() {
			$('#pw-quality-profile-table-chart table').remove();

			if (this.state.loading || this.state.noResults) {
				if (this.state.loading) {
					$('.ajax-loading').show();
				} else {
					$('#page-title .ajax-loading').hide();
				}

				return (
					<div id="gn-power-quality-chart">
						<div id="gn-power-quality-chart-header">
							<span><b>{GN.Lang.pqChart}</b></span>
						</div>
						<div id="gn-power-quality-chart-body">
							<div id="gn-chart-no-data">
								{this.state.loading ?
									<span className="ajax-loading">{' '}</span>
									: <span>{GN.Lang.noResults}</span>}
							</div>
						</div>
					</div>
				);
			}

			var showGraphA =
				this.state.voltageA || this.state.currentA || this.state.powerFactorA;

			var showGraphB =
				this.showPhaseB
				&& (this.state.voltageB || this.state.currentB || this.state.powerFactorB);

			var showGraphC =
				this.showPhaseC
				&& (this.state.voltageC || this.state.currentC || this.state.powerFactorC);

			var componentHeight;
			switch(this.phases) {
				case 1: componentHeight = 425; break;
				case 2: componentHeight = 600; break;
				case 3: componentHeight = 675; break;
			}

			return (
				<div id="gn-power-quality-chart" style={{height: componentHeight}}>					
					<div id="gn-power-quality-chart-header">
						<span><b>{GN.Lang.pqChart}</b></span>
					</div>
					<div id="gn-power-quality-chart-body">
						{this.graph && this.graph.length ?
							<div>
								<div className="gn-chart-svg"
									style={{paddingTop: (showGraphA ? 20 : 60) + 'px'}}>

									{this.phases === 1 ?
										null
										: <span className="gn-phase-id" style={{top: this.phases === 2 ? 100 : 50}}>A</span>}
									<svg className="gn-first" 
										style=
											{{display:
												(showGraphA || (!showGraphB && !showGraphC)) ?
													'block'
													: 'none',
											marginTop: this.phases === 1 ? '-15px' : '-60px',
											marginLeft: this.phases === 1 ? '0' : '40px'}}
										height=
											{this.state.height
											+ this.state.margin.top
											+ this.state.margin.bottom + 50}
										width=
											{this.state.width
											+ this.state.margin.left
											+ this.state.margin.right}>
										
										{this.state.linearGradients[0]}

										<g transform=
											{'translate('
												+ this.state.margin.left + ','
												+ this.state.margin.top + ')'}>
											
											<path className="gn-path-voltage gn-first"
												style={{
													display:
														this.state.voltageA ? 'block' : 'none'}}
												d={this.state.path}
												stroke="url(#gn-voltageAGrad)" />
											

											<path className="gn-path-current gn-first"
												style={{
													display:
														this.state.currentA ? 'block' : 'none'}}
												d={this.state.path2} />
										
											<path className="gn-path-power-factor gn-first"
												style={{
													display:
														this.state.powerFactorA ? 'block' : 'none'}}
												d={this.state.path3} />										

											<g className="x axis"
												transform={'translate(0,' + this.state.height + ')'} />
											
											{this.state.voltageA ?										
												<g className="y axis yaxis1 a">
													<text className="gn-uom" dx="-30px" dy="-15px">
														{GN.Lang.volts}
													</text>
												</g>
												: null}
											
											{(this.state.currentA && this.state.currentDomain) ?										
												<g className="y axis yaxis2 a"
														transform={'translate(' + this.state.width + ',0)'}>

													<text className="gn-uom" dy="-15px">
														{GN.Lang.amps}
													</text>
												</g>
												: null}

											{(this.state.powerFactorA && this.state.powerFactorDomain) ?
												<g className="y axis yaxis3 a"
														transform=
															{'translate('
																+ (this.state.width + (this.state.currentA ? 50 : 0))
																+ ',0)'}>

													<text className="gn-uom" dy="-15px">
														{GN.Lang.powerFactor}
													</text>
												</g>
												: null}
										</g>
									</svg>
									{showGraphB ?
										<span className="gn-phase-id gn-second" style={{top: this.phases === 2 ? 75 : 25}}>B</span>
										: null}
									<svg className="gn-second"
										style={{display: showGraphB ? 'block' : 'none'}}
										height={this.state.height + this.state.margin.top + this.state.margin.bottom + 50}
										width={this.state.width + this.state.margin.left + this.state.margin.right}>
										
										{this.state.linearGradients[1]}

										<g transform=
											{'translate(' + this.state.margin.left + ',' + this.state.margin.top + ')'}>										
											
											<path className="gn-path-voltage gn-second"
												style={{
													display:
														this.state.voltageB ? 'block' : 'none'}}
												d={this.state.path4}
												stroke="url(#gn-voltageBGrad)" />										

											<path className="gn-path-current gn-second"
												style={{
													display:
														this.state.currentB ? 'block' : 'none'}}
												d={this.state.path5} />								

											<path className="gn-path-power-factor gn-second"
												style={{
													display:
														this.state.powerFactorB ? 'block' : 'none'}}
												d={this.state.path6} />

											<g className="x axis"
												transform={'translate(0,' + this.state.height + ')'} />
											
											{this.state.voltageB ?										
												<g className="y axis yaxis1 b">
													<text className="gn-uom"
														dx="-30px"
														dy="-15px">

														{showGraphA ? '' : GN.Lang.volts}
													</text>
												</g>
												: null}
											
											{(this.state.currentB && this.state.currentDomainB) ?										
												<g className="y axis yaxis2 b"
														transform={'translate(' + this.state.width + ',0)'}>

													<text className="gn-uom" dy="-15px">
														{showGraphA ? '' : GN.Lang.amps}
													</text>
												</g>
												: null}

											{(this.state.powerFactorB && this.state.powerFactorDomainB) ?
												<g className="y axis yaxis3 b"
														transform=
															{'translate('
																+ (this.state.width + (this.state.currentB ? 50 : 0))
																+ ',0)'}>

													<text className="gn-uom" dy="-15px">
														{showGraphA ? '' : GN.Lang.powerFactor}
													</text>
												</g>
												: null}
										</g>
									</svg>
									{showGraphC ?
										<span className="gn-phase-id gn-third" style={{top: this.phases === 2 ? 65 : 15}}>C</span>
										: null}
									<svg className="gn-third"
										style={{display: showGraphC ? 'block' : 'none'}}
										height={this.state.height + this.state.margin.top + this.state.margin.bottom + 50}
										width={this.state.width + this.state.margin.left + this.state.margin.right}>
										
										{this.state.linearGradients[2]}

										<g transform=
											{'translate(' + this.state.margin.left + ',' + this.state.margin.top + ')'}>										
											<path className="gn-path-voltage gn-third"
												style={{
													display:
														this.state.voltageC ? 'block' : 'none'}}
												d={this.state.path7}
												stroke="url(#gn-voltageCGrad)" />

											<path className="gn-path-current gn-third"
												style={{
													display:
														this.state.currentC ? 'block' : 'none'}}
												d={this.state.path8} />

											<path className="gn-path-power-factor gn-third"
												style={{
													display:
														this.state.powerFactorC ? 'block' : 'none'}}
												d={this.state.path9} />

											<g className="x axis"
												transform={'translate(0,' + this.state.height + ')'} />
											
											{this.state.voltageC ?										
												<g className="y axis yaxis1 c">
													<text className="gn-uom"
														dx="-30px"
														dy="-15px">

														{!showGraphA && !showGraphB ?
															GN.Lang.volts
															: ''}
													</text>
												</g>
												: null}
											
											{(this.state.currentC && this.state.currentDomainC) ?										
												<g className="y axis yaxis2 c"
														transform={'translate(' + this.state.width + ',0)'}>

													<text className="gn-uom" dy="-15px">
														{!showGraphA && !showGraphB ?
															GN.Lang.amps
															: ''}
													</text>
												</g>
												: null}

											{(this.state.powerFactorC && this.state.powerFactorDomainC) ?
												<g className="y axis yaxis3 c"
														transform=
															{'translate('
																+ (this.state.width + (this.state.currentC ? 50 : 0))
																+ ',0)'}>

													<text className="gn-uom" dy="-15px">
														{!showGraphA && !showGraphB ?
															GN.Lang.powerFactor
															: ''}
													</text>
												</g>
												: null}
										</g>
									</svg>
								</div>
								<div id="gn-voltage-bands">
									<div><b><u>{GN.Lang.voltageBands}</u></b></div>
									 {this.state.legendVoltageBands.map(function(band, index) {
									 	return (
									 		<div key={index}>
									 			<svg height="10" width="10">
													<rect className="gn-band"
														style={{fill: '#' + band.color}}
														height="10"
														width="10" />
												</svg>
												<span>{band.bandName}</span>
									 		</div>
									 	);
									 })}
								</div>
								<div id="gn-chart-toggles">
									<div><b><u>{GN.Lang.phase + " A"}</u></b></div>
									<div>
										<input type="checkbox"
											onChange={this.clickVoltageA}
											checked={this.state.voltageA} />
										
										<svg>
											<line className="gn-path-voltage"
												x2={this.state.legendLineLength} />
										</svg>

										<span onClick={this.clickVoltageA}>
											{GN.Lang.voltage}
										</span>
									</div>
									{this.state.powerFactorDomain ?																	
										<div>
											<input type="checkbox"
												onChange={this.clickPowerFactorA}
												checked={this.state.powerFactorA} />
											
											<svg>
												<line className="gn-path-power-factor"
													x2={this.state.legendLineLength} />
											</svg>

											<span onClick={this.clickPowerFactorA}>
												{GN.Lang.powerFactor}
											</span>
										</div>
										: null}
									{this.state.currentDomain ?
										<div>
											<input type="checkbox"
												onChange={this.clickCurrentA}
												checked={this.state.currentA} />
											
											<svg>
												<line className="gn-path-current"
													x2={this.state.legendLineLength} />
											</svg>

											<span onClick={this.clickCurrentA}>
												{GN.Lang.current}
											</span>
										</div>
										: null}
									{this.showPhaseB  ?
										[<div key={0}><b><u>{GN.Lang.phase + " B"}</u></b></div>,
										<div key={1}>
											<input type="checkbox"
												onChange={this.clickVoltageB}
												checked={this.state.voltageB} />
											
											<svg>
												<line className="gn-path-voltage gn-second"
													x2={this.state.legendLineLength} />
											</svg>

											<span onClick={this.clickVoltageB}>
												{GN.Lang.voltage}
											</span>
										</div>,
										this.state.powerFactorDomainB ?
											<div key={2}>
												<input type="checkbox"
													onChange={this.clickPowerFactorB}
													checked={this.state.powerFactorB} />
												
												<svg>
													<line className="gn-path-power-factor gn-second"
														x2={this.state.legendLineLength} />
												</svg>

												<span onClick={this.clickPowerFactorB}>
													{GN.Lang.powerFactor}
												</span>
											</div>
											: null,
										this.state.currentDomainB ?
											<div key={3}>
												<input type="checkbox"
													onChange={this.clickCurrentB}
													checked={this.state.currentB} />
												
												<svg>
													<line className="gn-path-current gn-second"
														x2={this.state.legendLineLength} />
												</svg>

												<span onClick={this.clickCurrentB}>
													{GN.Lang.current}
												</span>
											</div>
											: null]
										: []}
									{this.showPhaseC ?
										[<div key={0}><b><u>{GN.Lang.phase + " C"}</u></b></div>,
										<div key={1}>
											<input type="checkbox"
												onChange={this.clickVoltageC}
												checked={this.state.voltageC} />
											
											<svg>
												<line className="gn-path-voltage gn-third"
													x2={this.state.legendLineLength} />
											</svg>

											<span onClick={this.clickVoltageC}>
												{GN.Lang.voltage}
											</span>
										</div>,
										this.state.powerFactorDomainC ?
											<div key={2}>
												<input type="checkbox"
													onChange={this.clickPowerFactorC}
													checked={this.state.powerFactorC} />
												
												<svg>
													<line className="gn-path-power-factor gn-third"
														x2={this.state.legendLineLength} />
												</svg>

												<span onClick={this.clickPowerFactorC}>
													{GN.Lang.powerFactor}
												</span>
											</div>
											: null,					
										this.state.currentDomainC ?
											<div key={3}>
												<input type="checkbox"
													onChange={this.clickCurrentC}
													checked={this.state.currentC} />
												
												<svg>
													<line className="gn-path-current gn-third"
														x2={this.state.legendLineLength} />
												</svg>

												<span onClick={this.clickCurrentC}>
													{GN.Lang.current}
												</span>
											</div>
											: null]
										: []}
								</div>								
							</div>
							: <div id="gn-chart-no-data">
								{GN.Lang.noData}
							</div>}
					</div>
					<div className="gn-chart-hover" />
				</div>
			);
		},
		componentDidUpdate: function() {
			if (!this.state.loading) {
				this.xAxis(d3.selectAll('.x.axis'));
				this.yAxisLeft(d3.selectAll('.yaxis1.a'));
				this.yAxisRight(d3.selectAll('.yaxis2.a'));
				this.yAxisRight2(d3.selectAll('.yaxis3.a'));
				this.yAxisLeftB(d3.selectAll('.yaxis1.b'));
				this.yAxisRightB(d3.selectAll('.yaxis2.b'));
				this.yAxisRight2B(d3.selectAll('.yaxis3.b'));
				this.yAxisLeftC(d3.selectAll('.yaxis1.c'));
				this.yAxisRightC(d3.selectAll('.yaxis2.c'));
				this.yAxisRight2C(d3.selectAll('.yaxis3.c'));

				$('g .x.axis g text').each(function(index) {					
					var labelParts;
					if (this.innerHTML) {
						var label = $(this);
				    	labelParts = label.html().split(' ');
				    	label.html('');
					} else { //for IE
						labelParts = this.textContent.split(' ');
				    	this.textContent = '';
						
					}

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

				if (!this.state.hoversAdded) {
					var hoverModal = $('.gn-chart-hover');
					var timeFormat = d3.time.format("%m/%d %H:%M");
					this.hoverPoints = {};

				   	this.addHovers(
				   		'voltageA',
				   		hoverModal,
				   		timeFormat,
				   		this.y0,
				   		'y',
				   		GN.Lang.volts,
				   		'gn-first',
				   		'.gn-path-voltage.gn-first');

				   	this.addHovers(
				   		'currentA',
				   		hoverModal,
				   		timeFormat,
				   		this.y1,
				   		'a',
				   		GN.Lang.amps,
				   		'gn-first',
				   		'.gn-path-current.gn-first');
				   	
				   	this.addHovers(
				   		'powerFactorA',
				   		hoverModal,
				   		timeFormat,
				   		this.y2,
				   		'z',
				   		GN.Lang.powerFactor,
				   		'gn-first',
				   		'.gn-path-power-factor.gn-first');
				   	
				   	this.addHovers(
				   		'voltageB',
				   		hoverModal,
				   		timeFormat,
				   		this.y0B,
				   		'y2',
				   		GN.Lang.volts,
				   		'gn-second',
				   		'.gn-path-voltage.gn-second');
				   	
				   	this.addHovers(
				   		'currentB',
				   		hoverModal,
				   		timeFormat,
				   		this.y1B,
				   		'a2',
				   		GN.Lang.amps,
				   		'gn-second',
				   		'.gn-path-current.gn-second');
				   	
				   	this.addHovers(
				   		'powerFactorB',
				   		hoverModal,
				   		timeFormat,
				   		this.y2B,
				   		'z2',
				   		GN.Lang.powerFactor,
				   		'gn-second',
				   		'.gn-path-power-factor.gn-second');
				   	
				   	this.addHovers(
				   		'voltageC',
				   		hoverModal,
				   		timeFormat,
				   		this.y0C,
				   		'y3',
				   		GN.Lang.volts,
				   		'gn-third',
				   		'.gn-path-voltage.gn-third');
				   	
				   	this.addHovers(
				   		'currentC',
				   		hoverModal,
				   		timeFormat,
				   		this.y1C,
				   		'a3',
				   		GN.Lang.amps,
				   		'gn-third',
				   		'.gn-path-current.gn-third');
				   	
				   	this.addHovers(
				   		'powerFactorC',
				   		hoverModal,
				   		timeFormat,
				   		this.y2C,
				   		'z3',
				   		GN.Lang.powerFactor,
				   		'gn-third',
				   		'.gn-path-power-factor.gn-third');

				    this.state.hoversAdded = true;
				    $('#page-title .ajax-loading').hide();

					this.offset = $('#gn-power-quality-chart').offset();
				}
			}
		},
		addHovers: function(toggle, hoverModal, timeFormat, scale, unit, unitCaption, phaseClass, pathSelector) {
			//The circles aren't actually necessary but make a nice landing spot for mouse

			d3.select('svg.' + phaseClass + ' g')
		   		.selectAll('dot')
		   		.data(
		   			this.graph.filter(function(d) {
			    		return d[unit] !== null && scale(d[unit]);
			    	}))
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

	        d3.selectAll('svg.' + phaseClass + ' circle').each(function(d) {
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
    				left: d3.event.pageX - this.offset.left - 55,
    				top: d3.event.pageY - this.offset.top - 66})
		},
		getDomain: function(graph, key1, key2, key3, percentPad) {
			var min =
				d3.min(
		    		graph,
		    		function(point) {
		    			return Math.min.apply(
							Math,
							[point[key1], point[key2], point[key3]].filter(function(value) {
								return value !== null && value !== undefined;
							}));
					});

			if (min === Infinity) {
				return null;
			}

		    var max =
		    	d3.max(
		    		graph,
		    		function(point) {
						return Math.max.apply(
							Math,
							[point[key1], point[key2], point[key3]].filter(function(value) {
								return value !== null && value !== undefined;
							}));
					});

		    if (max === -Infinity) {
				return null;
			}

			if ((key1 === 'y' || key2 === 'y2' || key3 === 'y3') && max - min < 1) {
				var extraRange = (1 - max + min) / 2;
				min -= extraRange;
				max += extraRange;
			} else if (key1 === 'z' || key2 === 'z2' || key3 === 'z3') {
				return [-1.2, 1.2];
			} else if (key1 === 'a' || key2 === 'a2' || key3 === 'a3') {
				if (min === max) {
					return [0, max === 0 ? 1 : max * 2];
				}

				if (max - min < 10) {
					var extraRange = (10 - max + min) / 2;
					min -= extraRange;
					max += extraRange;
				}
			}

		    var padding = percentPad ? ((max - min) / percentPad) : 0;
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
