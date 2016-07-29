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
