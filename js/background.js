var Background = (function (){
	// variables ----------------------------------------------------------------
	var _this 		= {},
		_pageData   = null,
        _users = [],
        _selectedUsers = [],
        _addedEmails = false,
        _addedUsers = false,
        _comment = null;
			
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		// list of website liked
		_pageData = null;
        _comment = null;
        
		// receive post messages from "inject.js" and any iframes
		chrome.extension.onRequest.addListener(onPostMessage);
		
		// manage when a user change tabs
		chrome.tabs.onActivated.addListener(onTabActivated);	
        
        // manage when a user clicks on action
        chrome.browserAction.onClicked.addListener(onBrowserActionClicked);
        
        //ParseData.logout();
	};
	
	// private functions --------------------------------------------------------
	function upateCurrentTab (){
		chrome.tabs.getSelected(null, function (tab){
			
            // update the current page ui
            //console.log("background.js: updateCurrentTab");           
		});
	};	
	
	function processMessage (request){
		// process the request
		switch (request.message){
			case 'save-uffda-share': message_onSaved(request.data); break;
			case 'all-iframes-loaded': message_allIframesLoaded(request.data); break;
            case 'toggle-user': message_onToggleUser(request.data); break;
            case 'user-login': message_onLoginUser(request.data); break;
            case 'filter-list': messageOnFilterList(request.data); break;    
            case 'change-comment': message_onChangeComment(request.data); break;
            case 'add-gmail': message_onAddGmail(request.data); break;
		}
	};
	function checkLogin (){
        // check login
        var login = ParseData.isLogin();
        if(!login){
            _this.tell('open-uffda-login');
        }else{
            ParseData.relationships();
            console.log("background.js User logged in, checking google contcts");
            
            if(ParseData.gmailIsSupported()){
                IdentityData.getUserContacts(false);
            }

            _this.tell("open-uffda-share");
        }
    };
    
	// events -------------------------------------------------------------------
	function onPostMessage (request, sender, sendResponse){
		if (!request.message) return;
		
		// if it has a "view", it resends the message to all the frames in the current tab
		if (request.data.view){
			_this.tell(request.message, request.data);
            if(request.message == 'open-overlay'){
                _pageData = request.data.content;
                console.log("background.js google"+ParseData.gmailIsSupported());
                _this.tell("add-relationships", {view:'*', users:_users, hasGmail: ParseData.gmailIsSupported() });
            }
            if(request.message == 'open-data-error'){
                console.log("opend-data-error");
                _gaq.push(['_trackEvent', 'open-data-error', request.data.linkError.toString()]);
            }
			return;
		}
		
		processMessage(request);
	};

	function onTabActivated (){
		upateCurrentTab();
	};
    
    function onBrowserActionClicked (){ 
        console.log("browserClicked");
        _selectedUsers.length = 0;
        checkLogin();
        _gaq.push(['_trackEvent', 'data', 'open-share']); 
    };

	// messages -----------------------------------------------------------------
	function message_onSaved (data){
		// save the share
        console.log("background.js: saved the share");
        ParseData.create(_pageData, _selectedUsers, _comment);  
         _gaq.push(['_trackEvent', 'shared', _pageData.mediaDomain.toString(), _selectedUsers.length.toString()]);
	};
	
	function message_allIframesLoaded (data){
		upateCurrentTab();
	};
    
    function message_onToggleUser(data){
        try {
            var found = jQuery.inArray(data.userId, _selectedUsers);
            if (found >= 0) {
                // Element was found, remove it.
                if(!data.selected){ 
                    console.log("background.js: poped "+data.userId);
                    _selectedUsers.splice(found, 1);
                    _this.tell("change-share-count", {view:'*', shareCount:_selectedUsers.length, users:_selectedUsers });
                }
            } else {
                // Element was not found, add it.
                if(data.selected){ //true means add
                    console.log("background.js: pushed "+data.userId);
                    _selectedUsers.push(data.userId);
                    _this.tell("change-share-count", {view:'*', shareCount:_selectedUsers.length, users:_selectedUsers });
                }
            }   
            _gaq.push(['_trackEvent', 'data', 'toggle-user']); 
         } catch(err){
             return;
         }
    };
    
    function message_onLoginUser (data){
		console.log("background.js loging-in");
        ParseData.login(data.username, data.password);
	};
    
    function messageOnFilterList (data){
        console.log("background.js filter-list");
        _filterUsers = [];
        $.each(_users, function( index, user ) {
            if((user.username.toLowerCase()).indexOf(data.search.toLowerCase()) >= 0){
                _filterUsers.push(user);
            }
        });
        _this.tell("add-relationships", {view:'*', users:_filterUsers, hasGmail: ParseData.gmailIsSupported() });
        _this.tell("change-share-count", {view:'*', shareCount:_selectedUsers.length, users:_selectedUsers });
        _gaq.push(['_trackEvent', 'data', 'filter-relationships']); 
    }
    
    function message_onChangeComment (data){
        _comment = data.comment;
    }
    
    function message_onAddGmail (data){
        IdentityData.getUserContacts(true);
    }
    
	// public functions ---------------------------------------------------------    
	_this.tell = function (message, data){
		var data = data || {};
		
		// find the current tab and send a message to "inject.js" and all the iframes
		chrome.tabs.getSelected(null, function (tab){
			if (!tab) return;
			chrome.tabs.sendMessage(tab.id, {
				message	: message,
				data	: data
			});
		});
	};
    
    _this.addRelationships = function (users){
        if(!_addedUsers){
            _users = $.merge(users, _users);
            _addedUsers = true;
            _this.tell("add-relationships", {view:'*', users:_users, hasGmail: ParseData.gmailIsSupported() });
            _gaq.push(['_trackEvent', 'data', 'add-relationships']);  
        }
    };
    _this.addEmails = function (emails){
        if(!_addedEmails){
            _users = $.merge(_users, emails);
            _addedEmails = true;
            _this.tell("add-relationships", {view:'*', users:_users, hasGmail: ParseData.gmailIsSupported() });
            _gaq.push(['_trackEvent', 'data', 'add-emails']); 
        }
    }
    _this.userLoginSuccess = function (){
        checkLogin();
        _gaq.push(['_trackEvent', 'data', 'user-login']);  
    };
    _this.userLoginFailed = function (){
        console.log("background.js userLoginFailed");
        _this.tell("login-failed", {view:'*'});
        _gaq.push(['_trackEvent', 'data', 'login-failed']);  
    };
    _this.errorSavingContent = function (){
        _this.tell("saving-failed");
        _this.tell("saving-failed", {view:'*'});
        _gaq.push(['_trackEvent', 'data', 'saving-failed']);        
    };
	
	return _this;
}());


var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-48563434-3']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

window.addEventListener("load", function() { Background.init(); }, false);