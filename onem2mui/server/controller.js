module.exports = function(soapClient, app, config) {
	app.post('/ws/*', (req, res) => {		
		var method = req.url.split('/')[2];
		if (!method) {
			error("WS method was not specified", res);		
			return;
		}
		
		if (!soapClient[method]) {
			error("Unknown WS method: " + method, res);
			return;
		}
		
		soapClient.clearSoapHeaders();
		
		if (req.signedCookies && req.signedCookies.session) {
			soapClient.addSoapHeader({'policynet:LoginUsername': req.signedCookies.username});
			soapClient.addSoapHeader({'policynet:SessionId': req.signedCookies.session});
		}
		
		var reqParams = JSON.parse(req.body.data)
		soapClient[method](reqParams, (err, result) => {
	    	if (err) {
	    		try {
	    			//console.log(err); //TODO: only print to error log
	    			
		    		var errorObject =
		    			{statusMessage: err.response.statusMessage,
		        		statusCode: err.response.statusCode}
		        		
		    		var errorParts = err.body.split('<policynet:Exception code="');
					if (errorParts[1]) { //policynet:Exception
						errorObject.exceptionCode = Number(errorParts[1].split('"')[0]);
						
						var exParts =
							errorParts[1].split('description="')[1].split('"></policynet:Exception>')
						
						errorObject.exceptionDescription = exParts[0];
					} else { //<SOAP-ENV:Fault>
						errorParts = err.body.split('<SOAP-ENV:Value>');
						if (errorParts[1]) {
							errorObject.faultValue = errorParts[1].split('</SOAP-ENV:Value>')[0];
							
							var exParts =
								errorParts[1].split('<SOAP-ENV:Text>')[1].split('</SOAP-ENV:Text>');
							
							errorObject.faultReason = decodeHTMLEntities(exParts[0]).trim();
						}
					}
					
					error(errorObject, res);
	    		} catch (e) {
	    			error(e, res);
	    		} finally {
	    			return;
	    		}
	    	}
			
			console.log(result); //TODO: only print to a soap log
			
			if (result && result.attributes && result.attributes.sessionId) {
				res.cookie(
					'username',
					reqParams.attributes.username,
					{maxAge: 1800000, secure: config.useTLS, signed: true});
				
				res.cookie(
					'session',
					result.attributes.sessionId,
					{maxAge: 1800000, secure: config.useTLS, signed: true});
				
				delete result.attributes; //lastLoginDate, sessionId, userId
			} else if (method === 'logout' && !result) {
				res.clearCookie('username');
				res.clearCookie('session');
			}
			
	    	res.end(JSON.stringify(result));
	    });
	});
}

function decodeHTMLEntities(str) {
	return str.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, "&");
}

function error(error, res) {
	console.log(error); //TODO: print to error log also	
	res.end(JSON.stringify({error: error}));
}