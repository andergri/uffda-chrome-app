var Inject = (function (){
	// constants ----------------------------------------------------------------
	var ID = {
        POPUP           : 'uffda-box',
		CONTAINER		: 'uffda-container',
		IFRAME_PREFIX	: 'uffda-iframe-'
	};
	
	// variables ----------------------------------------------------------------
	var _this		= {},
		_views		= {},
		_container	= null,
        _box        = null;
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		// create the main container
        _box = $('<iframe />', {id:ID.POPUP});
		_box.appendTo(document.body);
        var cssURL = chrome.extension.getURL("css/inject.css");
        _box.contents().find('head').append('<link type="text/css" rel="stylesheet" href="'+cssURL+'" media="all" />');
		_container = $('<div />', {id:ID.CONTAINER});
        _box.contents().find("body").append(_container);
        
		//_container.appendTo(_box.body);
		
		// add the "overlay" and "footer" iframe
        getView('errorn', _container);
        getView('login', _container);
        getView('header', _container);
        getView('musketeers', _container);
        getView('main', _container);
        getView('footer', _container);
		// listen to the iframes/webpages message
		window.addEventListener("message", dom_onMessage, false);
	
		// listen to the Control Center (background.js) messages
		chrome.extension.onMessage.addListener(background_onMessage);
	};
	
	// private functions --------------------------------------------------------
	function getView (id){
		// return the view if it's already created
		if (_views[id]) return _views[id];
		
		// iframe initial details
		var src		= chrome.extension.getURL('html/iframe/'+id+'.html?view='+id+'&_'+(new Date().getTime())),
			iframe	= $('<iframe />', {id:ID.IFRAME_PREFIX+id, src:src, scrolling:false});
		
		// view
		_views[id] = {
			isLoaded	: false,
			iframe		: iframe
		};
		
		// add to the container
		_container.append(iframe);
		
		return _views[id];
	};
	
	function tell (message, data){
		var data = data || {};
		
		// send a message to "background.js"
		chrome.extension.sendRequest({
			message : message,
			data	: data
		});
	};
	
	function processMessage (request){
		if (!request.message) return;
		
		switch (request.message){
			case 'iframe-loaded': message_onIframeLoaded(request.data); break;
            case 'open-uffda-login': message_onLogin(request.data); break;    
			case 'open-uffda-share': message_onOpen(request.data); break;
			case 'save-uffda-share': message_onSaved(request.data); break;
            case 'exit-uffda': message_onExit(request.data); break;
            case 'add-user': message_onAddUser(request.data); break;
            case 'login-user': message_onLoginUser(request.data); break;
            case 'saving-failed': message_onError(request.data); break;   
            case 'filter-list': message_onFilterList(request.data); break;    
            case 'change-comment': message_onAddComment(request.data); break;
            case 'add-gmail': message_onAddGmail(request.data); break;
		}
	};
	
    function showBody(){
        $("#"+ID.POPUP).show();
    };
    function hideBody(){
        $("#"+ID.POPUP).hide();
    };
    
	// events -------------------------------------------------------------------	
	// messages coming from iframes and the current webpage
	function dom_onMessage (event){		
        
		if (!event.data.message) return;
		
		// tell another iframe a message
		if (event.data.view){
			tell(event.data);
		}else{
			processMessage(event.data);
		}
	};
	
	// messages coming from "background.js"
	function background_onMessage (request, sender, sendResponse){
		if (request.data.view) return;		
		processMessage(request);
	};
	
	// messages -----------------------------------------------------------------
	function message_onIframeLoaded (data){
		var view 		= getView(data.source),
			allLoaded	= true;
		
		view.isLoaded = true;
		
		for (var i in _views){
			if (_views[i].isLoaded === false) allLoaded = false;
		}
		// tell "background.js" that all the frames are loaded
		if (allLoaded) tell('all-iframes-loaded');
	};
    
    function message_onError (data){
        var errorn = getView('errorn');	
		errorn.iframe.show();
        var footer = getView('footer');	
		footer.iframe.show();
    }
	
    function message_onExit (data){
        hideBody();
        var errorn = getView('errorn');	
		errorn.iframe.hide();
        var login = getView('login');	
		login.iframe.hide();
        var header = getView('header');	
		header.iframe.hide();
        var main = getView('main');	
		main.iframe.hide();
        var musketeers = getView('musketeers');	
		musketeers.iframe.hide();
        var footer = getView('footer');	
		footer.iframe.hide();
    };
    
    function message_onLogin (data){
        message_onExit (data);
        showBody();
        var login = getView('login');	
        login.iframe.show();
        var footer = getView('footer');	
		footer.iframe.show();
        tell('open-login', {view:'*'}); 
	};
    
	function message_onOpen (data){
        message_onExit (data);
        showBody();
        var errorn = getView('errorn'); 
        var header = getView('header');
        var main = getView('main');
        var musketeers = getView('musketeers');	
        var footer = getView('footer');	
		footer.iframe.show();
        
        var content;
        if(MetaData.isMediaValid()){
            console.log("inject.js data valid");
            //views
            header.iframe.show();
            musketeers.iframe.show();
		    main.iframe.show();
            content = MetaData.getMedia();
            tell('open-overlay', {view:'*', content:content});
        }else{
            errorn.iframe.show();
            console.log("inject.js data not valid");
            tell('open-data-error', {view:'*', linkError:window.location.href});
        }
	};
		
	function message_onSaved (data){
        console.log("inject.js: onSaved");
		message_onExit (data);
		
		// tell "background.js" to save the liked page
		tell('save-uffda-share', {url:window.location.href, title:document.title, comment:data.comment});
	};
    
    function message_onAddUser (data){
        tell('toggle-user', data);
    };
    function message_onLoginUser(data){
        console.log("inject.js onLoginUser");
        tell('user-login', data);
    };
    
    function message_onFilterList(data){
        console.log("inject.js onFilterList");
        tell('filter-list', data);
    }
    
    function message_onAddComment(data){
        tell('change-comment', data);
    }
    
    function message_onAddGmail(data){
        tell('add-gmail', data);
    }
	
	return _this;
}());
document.addEventListener("DOMContentLoaded", function (){ Inject.init(); }, false);
