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

export default class Tab {
	constructor(tabs) {
		this.tabs = tabs;
	}
	
	getCountFrom(text) {
		return Number(text.slice(1, text.length - 1));
	}
	
	getCountLabel() {
		return browser.getText(this.getLabelSelector() + " .ui-tabs-sublabel");
	}
	
	getOpStatePercents() {
		return browser.getText(this.getTabBodySelector() + " .vert-nav .devdash-ln-stat");
	}
}