var Main = (function (){
	// variables ----------------------------------------------------------------
	var _this 		= {},
		_iframe		= null;
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		_iframe = new IframeManager();
		_iframe.setListener(onMessage);

        $('#mainBox').on('keyup','#message', comment_onKeydown);
	};
	
	// private functions --------------------------------------------------------

	// events -------------------------------------------------------------------
	function onMessage (request){
		switch (request.message){
			case 'open-overlay': 
				message_onOpenOverlay(request.data); 
				break;
		}
	};
	// messages -----------------------------------------------------------------
	function message_onOpenOverlay (data){
		//set stuff
        $('.page-image').attr("src", data.content.mediaImage);
        $('.page-title').html(data.content.mediaTitle);
        //$('.page-subtitle').html(data.content.mediaSubTitle);
	};
	
    function comment_onKeydown (event){
        var comment = $("#message").val();
        _iframe.tell('change-comment', {comment:comment});
    }
	
	// public functions ---------------------------------------------------------

	return _this;
}());

document.addEventListener("DOMContentLoaded", function (){ new Main.init(); }, false);