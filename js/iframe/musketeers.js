var Musketeers = (function (){
	// variables ----------------------------------------------------------------
	var _this 		= {},
		_iframe		= null;
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		_iframe = new IframeManager();
		_iframe.setListener(onMessage);

        $('.musketeersList').on('click', "li a", toggle_onClick);
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
        	case 'change-share-count': 
				message_onShareCount(request.data); 
				break;
		}
	};
    
    function toggle_onClick (event){
        event.preventDefault();
        $(this).toggleClass("selected");
		
		_iframe.tell('add-user', {
			userId	: $(this).attr("data-id"),
            selected: $(this).hasClass( "selected" )
		});
	};
    
	// messages -----------------------------------------------------------------
	function message_onOpenOverlay (data){
		//things are great show stuff
	};
    
    function message_onAddRelationships (data){
        $('.musketeersList').empty();
        $.each(data.users, function( index, user ) {
            
            if(user.type == "Parse"){
                $('.musketeersList').append('<li><a href="#" class="profileButton" data-id="'+user.objectId+'"><img src="'+user.thumbnail+'" /><h6>'+user.username+'</h6><div class="profileClick"><span>&#x2713;</span></div></a></li>');
            }else{
                $('.musketeersList').append('<li><a href="#" class="profileButton" data-id="'+user.objectId+'"><div class="profileDeafult">'+user.username.slice(0,1).toUpperCase()+'</div><h6>'+user.username+'</h6><div class="profileClick"><span>&#x2713;</span></div></a></li>');
            }    
        });
    }
    function message_onShareCount (data){
        console.log("musk.js"+ data.users);
        $( ".musketeersList li a" ).each(function( index ) {
            var userA = $(this).attr("data-id");
            var found = false;
            found = jQuery.inArray(userA, data.users);
            if(((found >= 0) && !$(this).hasClass("selected")) || ((found < 0) && $(this).hasClass("selected"))){
                console.log("musk.js hit!"+index);
                 $(this).toggleClass("selected");
            }
        });
    }
	
	
	// public functions ---------------------------------------------------------

	return _this;
}());

document.addEventListener("DOMContentLoaded", function (){ new Musketeers.init(); }, false);