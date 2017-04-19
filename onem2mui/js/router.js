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
 ****************************************************************************

Background image: Copyright (c) 2016 by Jonas Badalic (http://codepen.io/JonasB/pen/dPyGWw)
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY */

import Backbone from 'backbone';
import ReactDOM from 'react-dom';
import React from 'react';
import $ from 'jquery';
import BuildURL from './utils/buildurl';
import Page from './components/page';

new (Backbone.Router.extend({
    initialize: function() {
    	var usePushStates = "pushState" in history;
    	Backbone.history.start({pushState: usePushStates, hashChange: usePushStates});
    },
    routes: {
//    	'/upgrade': 'upgrade',
    	'*allOtherPages': 'dashboard'
    },
    dashboard: function() {
    	//this.parseQueryParams(['param1', 'param2'])}); //allowed params
    	
    	this.render({showDashboard: true, params: {}}); 
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
    render: function(state) {
    	if (this.page) {
			this.page.setState($.extend(state, {reload: true}));
		} else {
			this.page =
				ReactDOM.render(
					React.createElement(Page, state),
					$('<div class="gn-react-content"/>').prependTo($('#gn-content'))[0]);
		}
    },
    navigateTo: function(URL, params) {
    	var URL = BuildURL("/" + URL, params);
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