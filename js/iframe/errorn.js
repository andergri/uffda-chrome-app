var Errorn = (function (){
	// variables ----------------------------------------------------------------
	var _this 		= {},
		_iframe		= null;
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		_iframe = new IframeManager();
		_iframe.setListener(onMessage);

        $('.page-close').on('click', exit_onClick);
	};
	
	// private functions --------------------------------------------------------

	// events -------------------------------------------------------------------
	function onMessage (request){
		switch (request.message){
    		case 'open-data-error': 
				message_onOpenDataError(request.data); 
				break;
        	case 'saving-failed': 
				message_onOpenSavingError(request.data); 
				break;
		}
	};
    function exit_onClick (event){	
		_iframe.tell('exit-uffda');
	};
	// messages -----------------------------------------------------------------
    function message_onOpenDataError (data){
        $('#errornBox .share-data-error').hide();
        $('#errornBox .page-data-error').show();
    }
    function message_onOpenSavingError (data){
        $('#errornBox .page-data-error').hide();
        $('#errornBox .share-data-error').show();
    }
	
	// public functions ---------------------------------------------------------

	return _this;
}());

document.addEventListener("DOMContentLoaded", function (){ new Errorn.init(); }, false);