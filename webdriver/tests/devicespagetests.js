/****************************************************************************
 *             GRID NET, INC. CONFIDENTIAL
 *
 * The source code contained or described herein and all documents related
 * to the source code ("Material") are owned by Grid Net, Inc. or its
 * suppliers or licensors. Title to the Material remains with Grid Net or its
 * suppliers and licensors. The Material contains trade secrets and proprietary
 * and confidential information of Grid Net or its suppliers and licensors. The
 * Material is protected by worldwide copyright and trade secret laws and treaty
 * provisions. No part of the Material may be used, copied, reproduced, modified,
 * published, uploaded, posted, transmitted, distributed, or disclosed in any way
 * without the prior express written permission of Grid Net, Inc.
 *
 * No license under any patent, copyright, trade secret or other intellectual
 * property right is granted to or conferred upon you by disclosure or delivery
 * of the Material, either expressly, by implication, inducement, estoppel or
 * otherwise. Any license under such intellectual property rights must be
 * express and approved by Grid Net, Inc. in writing.
 *
 *      Copyright (c) 2006-2008 Grid Net, Inc.  All Rights Reserved.
 *
 *  Author: Jeff Poyzner
 *
 ****************************************************************************/

import runscript from './util/runscript';
import DevicesPage from './objects/devices/devicespage';
import login from './actions/login';
import logout from './actions/logout';

//runscript('addmeters', () => {
	describe('devices page tests', function() {
		var page = new DevicesPage();
		
		it('should have six tabs with names on them', (done) => {
			page.tabs.elements().then((res) => {
			   expect(res.value.length).to.be.equal(page.tabs.getCount());
			}).call(done);
	    });
		
		it('should be able to click on demand response tab and open the tab', (done) => {
			page.tabs.dredTab.open().waitThen(() => {
				page.tabs.dredTab.getHeading().then((text) => {
					expect(text).to.include.string(page.tabs.dredTab.HEADING);
				}).call(done);
			});
		});
		
		it('should have an electric meter tab with a positive count on label', (done) => {
			page.tabs.electricTab.getCountLabel().then((text) => {
				expect(page.tabs.electricTab.getCountFrom(text)).to.be.above(0);
			}).call(done);
		});
		
		it('should be able to click on electric meters tab and open the tab', (done) => {
			page.tabs.electricTab.open().waitThen(() => {
				page.tabs.electricTab.getHeading().then((text) => {
					expect(text).to.include.string(page.tabs.electricTab.HEADING);	
				}).call(done);
			});
		});
		
		it('should see  Inventory, Discovered, Remote, Local, and RMA states', (done) => {

		});
		
		it('should have all op state percentages add up to 100', (done) => {
			page.tabs.electricTab.getOpStatePercents().then((texts) => {
				var percentage = 0;
				texts.forEach(function(text) {
					percentage += parseInt(text);
				});

				expect(percentage).to.be.above(99 - texts.length); //because of rounding
				expect(percentage).to.be.below(101);	
			}).call(done);
		});
		
		it('should be able to logout and log back in as tenant', (done) => {
			logout(() => {
				login(() => {					
					done();
				},
				true);
			});
		});
		
		it('should only see Discovered, Remote, and RMA states ');
	});
	
	//TODO: ADD POLICY TESTS NEXT!!!
	//demand
	//demand LP
	//TOU LP
//});