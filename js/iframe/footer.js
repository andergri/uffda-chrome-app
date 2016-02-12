var Footer = (function (){
	// variables ----------------------------------------------------------------
	var _this 		= {},
		_iframe		= null;
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		_iframe = new IframeManager();
		_iframe.setListener(onMessage);

        $('#save').on('click', save_onClick); 
	};
	
	// private functions --------------------------------------------------------

	// events -------------------------------------------------------------------
	function onMessage (request){
		switch (request.message){
			case 'open-overlay': 
				message_onOpenOverlay(request.data); 
				break;
            case 'open-login': 
				message_onOpenLogin(request.data); 
				break;
    		case 'change-share-count': 
				message_onShareCount(request.data); 
				break;
    		case 'open-data-error': 
				message_onOpenDataError(request.data); 
				break;
        	case 'saving-failed': 
				message_onOpenSavingError(request.data); 
				break;
		}
	};

    function save_onClick (event){
		_iframe.tell('save-uffda-share');
	};
    
	// messages -----------------------------------------------------------------
	function message_onOpenOverlay (data){
		//things are great show stuff
        $('#footerBox button').show();
        $('#footerBox p').show();
        $("#footerBox button").attr("disabled", "disabled");
        $('#shareCount').html(0);
	};
    function message_onOpenLogin (data){
        $('#footerBox button').hide();
        $('#footerBox p').hide();
	};
    function message_onShareCount (data){
        $('#shareCount').html(data.shareCount);
        if(data.shareCount > 0){
            $("#footerBox button").removeAttr("disabled");
        }else{
            $("#footerBox button").attr("disabled", "disabled");
        }
    }
    function message_onOpenDataError (data){
        $('#footerBox button').hide();
        $('#footerBox p').hide();
    }
    function message_onOpenSavingError (data){
        $('#footerBox button').hide();
        $('#footerBox p').hide();
    }
	// public functions ---------------------------------------------------------

	return _this;
}());

document.addEventListener("DOMContentLoaded", function (){ new Footer.init(); }, false);