var IdentityData = (function (){

	// variables ----------------------------------------------------------------
	var _this		= {},
		_contacts   = [];
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
        console.log("identity started");
	};
	
	// private functions --------------------------------------------------------
    function onContacts(text, xhr) {
        
      var data = JSON.parse(text);
      for (var i = 0, entry; entry = data.feed.entry[i]; i++) {
        var contact = {
          'name' : entry['title']['$t'],
          'id' : entry['id']['$t'],
          'emails' : []
        };

        if (entry['gd$email']) {
          var emails = entry['gd$email'];
          for (var j = 0, email; email = emails[j]; j++) {
            contact['emails'].push(email['address']);
          }
        }

        if (!contact['name']) {
          contact['name'] = contact['emails'][0] || "<Unknown>";
        }
        _contacts.push(contact);
      }
    };

    // @corecode_begin getProtectedData
  function xhrWithAuth(method, url, interactive, callback) {
    var access_token;

    var retry = true;

    getToken();

    function getToken() {
      chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
        if (chrome.runtime.lastError) {
          callback(chrome.runtime.lastError);
          return;
        }

        access_token = token;
        ParseData.saveGmailToken(token); 
        requestStart();
      });
    }

    function requestStart() {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
      xhr.onload = requestComplete;
      xhr.send();
    }

    function requestComplete() {
      if (this.status == 401 && retry) {
        retry = false;
        chrome.identity.removeCachedAuthToken({ token: access_token },
                                              getToken);
      } else {
        callback(null, this.status, this.response);
      }
    }
  };

  // Code updating the user interface, when the user information has been
  // fetched or displaying the error.
  function onUserInfoFetched(error, status, response) {
    if (!error && status == 200) {
      //changeState(STATE_AUTHTOKEN_ACQUIRED);
    console.log("identity.js a");
      console.log(response);
      var user_info = JSON.parse(response);
      populateUserInfo(user_info);
    } else {
      //changeState(STATE_START);
    }
  };

  function populateUserInfo(user_info) {
        
      for (var i = 0, entry; entry = user_info.feed.entry[i]; i++) {
        var contact = {
          'username' : entry['title']['$t'],
          'id' : entry['id']['$t'],
          'emails' : [],
          'type': "email",
          'objectId': "--"
        };
          
        if (entry['gd$email']) {
          var emails = entry['gd$email'];
          for (var j = 0, email; email = emails[j]; j++) {
            contact['emails'].push(email['address']);
            contact['objectId'] = email['address'];
          }
          //contact['objectId'] = contact['emails'].firstChild;
        }

        if (!contact['username']) {
          contact['username'] = contact['emails'][0] || "<Unknown>";
        }
        _contacts.push(contact);
      } 
      Background.addEmails(_contacts);
  };
    
    // Public Functions
	
  _this.getUserContacts = function(interactive) {
    xhrWithAuth('GET',
                'http://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=100000',
                interactive,
                onUserInfoFetched);
  };
    
	return _this;
}());
document.addEventListener("DOMContentLoaded", function (){ IdentityData.init(); }, false);