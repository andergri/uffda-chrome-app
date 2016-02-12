var Header = (function (){
	// variables ----------------------------------------------------------------
	var _this 		= {},
		_iframe		= null;
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		_iframe = new IframeManager();
		_iframe.setListener(onMessage);

        $('.page-close').on('click', exit_onClick);
        $('#headerBox').on('keyup','#search', search_onKeydown);
        $('#integrationGmail').on('click', addGmail_onClick);
	};
	
	// private functions --------------------------------------------------------

	// events -------------------------------------------------------------------
	function onMessage (request){
		switch (request.message){
            case 'add-relationships': 
				message_onAddRelationships(request.data); 
				break;
			case 'open-overlay': 
				message_onOpenOverlay(request.data); 
				break;
		}
	};
    
    function addGmail_onClick (event){	
		_iframe.tell('add-gmail');
	};

    function exit_onClick (event){	
		_iframe.tell('exit-uffda');
	};
    
    function search_onKeydown (event){
        var search = $("#search").val();
        console.log('header.js' + search);
        _iframe.tell('filter-list', {search:search});
    }
    
	// messages -----------------------------------------------------------------
	function message_onOpenOverlay (data){
		//things are great show stuff
	};
    function message_onAddRelationships (data){
        console.log("header.js google"+data.hasGmail);
        
        if(true && !$("#integrationMobile").hasClass("selected")){
            $("#integrationMobile").removeAttr('href');
            $("#integrationMobile").toggleClass("selected");
        }
        if(data.hasGmail && !$("#integrationGmail").hasClass("selected")){
            $("#integrationGmail").removeAttr('href');
            $("#integrationGmail").toggleClass("selected");
        }
    }

	// public functions ---------------------------------------------------------

	return _this;
}());

document.addEventListener("DOMContentLoaded", function (){ new Header.init(); }, false);