var Login = (function (){
	// variables ----------------------------------------------------------------
	var _this 		= {},
		_iframe		= null;
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		_iframe = new IframeManager();
		_iframe.setListener(onMessage);

        $("#loginBox button").on('click', login_onClick);
        $('.page-close').on('click', exit_onClick);
	};
	
	// private functions --------------------------------------------------------

	// events -------------------------------------------------------------------
	function onMessage (request){
		switch (request.message){
			case 'open-login': 
				message_onOpenlogin(request.data); 
				break;
        	case 'login-failed': 
				message_onLoginFailed(request.data); 
				break;
		}
	};
    function exit_onClick (event){	
		_iframe.tell('exit-uffda');
	};
    function login_onClick (event){
        console.log("login.js try login");
        var username = $("#login-username").val();
        var password = $("#login-password").val();
        _iframe.tell('login-user', {username:username, password:password});
    };
	// messages -----------------------------------------------------------------
	function message_onOpenlogin (data){
		//set stuff
	};
    function message_onLoginFailed (data){
		//set stuff
        console.log("login.js login failed");
        $(".login-form .error").html("Invalid username or password. Please try again.").show();
        $(".login-form button").removeAttr("disabled");
	};
	
	// public functions ---------------------------------------------------------

	return _this;
}());

document.addEventListener("DOMContentLoaded", function (){ new Login.init(); }, false);