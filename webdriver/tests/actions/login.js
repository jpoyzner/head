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

export default (done, asTenant) => {
	var username, password;
	if (browser.options.user) {
		var creds = browser.options.user.split('/');
		username = creds[0];
		password = creds[1];
	} else {
		username = browser.options.user || (asTenant ? 'admin@ci.com' : 'admin@ci.com');
		password = browser.options.key || (asTenant ? '430!ganG621@' : '430!ganG621@');
	}

	console.log(password);

	browser.url('/').waitThen(() => {
		browser.setValue('#username', username).waitThen(() => {
			browser.setValue('#password', password).waitThen(() => {
				browser.click('#login').waitThen(done, 5000);
			});
		});
	},
	5000);
};