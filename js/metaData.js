var MetaData = (function (){
	
	// variables ----------------------------------------------------------------
	var _this		          = {},
        _isMediaValid         = false,
		_mediaType		      = null,
		_mediaTitle	          = null,
        _mediaSubTitle        = null,
        _mediaPublished       = null,
        _mediaDomain          = null,
        _mediaLink            = null,
        _mediaImage           = null,
        _mediaVisualContent   = null,
        _mediaPlayableContent = null,
        _mediaReadableContent = null;
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		clearVariables();
        getData();
	};
	
	// private functions --------------------------------------------------------

    
    
    function getType(){
        //$('meta[property="og:type"]').attr('content');// music.,video.,article, website, book, profile
        _mediaType = "article";
    }
    function getTitle(){
      if($('meta[property="og:title"]').attr('content')){
            _mediaTitle = $('meta[property="og:title"]').attr('content');
        }if($('meta[name="twitter:title"]').attr('content')){
            _mediaTitle = $('meta[name="twitter:title"]').attr('content');
        }else{
            _mediaTitle = document.title;
        }
    }
    function getSubtitle(){
        if($('meta[property="og:description"]').attr('content')){
            _mediaSubTitle = $('meta[property="og:description"]').attr('content');
        }else if($('meta[name="twitter:description"]').attr('content')){
            _mediaSubTitle = $('meta[name="twitter:description"]').attr('content');
        }else if($('meta[name="description"]').attr('content')){
            _mediaSubTitle = $('meta[name="description"]').attr('content');
        }else {
            _mediaSubTitle = null;
        }
    }
    function getPublished(){
        var datetime = new Date();
        _mediaPublished = Math.round(datetime.getTime()/1000);
    }
    function getDomain(){
        if($('meta[property="og:site_name"]').attr('content')){
            _mediaDomain = $('meta[property="og:site_name"]').attr('content');
        }else if($('meta[name="page.content.source"]').attr('content')){
            _mediaDomain = $('meta[name="page.content.source"]').attr('content');
        }else if($('meta[name="twitter:site"]').attr('content')){
            _mediaDomain = $('meta[name="twitter:site"]').attr('content');
        }else if(window.location.host){
            _mediaDomain = window.location.host;
        }else{
            _mediaDomain = null;
        }
    }
    function getLink(){
        if($('meta[property="og:url"]').attr('content')){
            _mediaLink = $('meta[property="og:url"]').attr('content');
        }else{
            _mediaLink = window.location.href;
        }
    }
    function getImage(){
        
        var images = [];
        var wi = 260;
        var he = 260;
        
        if($('meta[name="twitter:image"]').attr('content')){
            $("<img/>").attr("src", $('meta[name="twitter:image"]').attr('content')).load(function() {
                //console.log("metaData.js twitter w="+this.width + " h=" + this.height);
                if(this.width > wi && this.height > he){
                    console.log("metaData.js img grabbed twitter");
                    images.push($('meta[name="twitter:image"]').attr('content'));
                    _mediaImage = $('meta[name="twitter:image"]').attr('content');
                }
            });
        }
        if($('meta[property="og:image"]').attr('content')){ //array
            $("<img/>").attr("src", $('meta[property="og:image"]').attr('content')).load(function() {
                //console.log("metaData.js og w="+ this.width + " h=" + this.height);
                if(this.width > wi && this.height > he){
                    console.log("metaData.js img grabbed og");
                    images.push($('meta[property="og:image"]').attr('content'));
                    _mediaImage = $('meta[property="og:image"]').attr('content');
                }
            });
        }
        
        Array.prototype.forEach.call( document.images, function( img ) {
             //console.log("metaData.js loop w="+ img.width + " h=" + img.height);
             if(img.width > wi && img.height > he){
                 images.push(img.src);
              }
        });
        
        console.log("metaData.js arr length"+ images.length);
        
        if(images.length > 0){
            console.log("metaData.js img grabbed loop");
            _mediaImage = images.splice(0, 1);
        }else{
            _mediaImage = "http://files.parse.com/913046fd-1ac8-485e-9b7b-ad42180b9edd/3bd38624-01d8-4665-9223-a4e995e52315-share_%20_1401947921.218623.png";
            //_mediaImage = null;
        }
        console.log("metaData.js img"+ _mediaImage);
    }
    
    function getVisualContent(){
        _mediaVisualContent = null;
    }
    function getPlayableContent(){
        _mediaPlayableContent = null;
        //$('meta[property="og:audio"]').attr('content');
        //$('meta[property="og:video"]').attr('content');
    }
    function getReadableContent(){
        _mediaReadableContent = null;
    }
    // Helper functions --------------------------------------------------------
    function clearVariables(){
        _isMediaValid         = false;
		_mediaType		      = null;
		_mediaTitle	          = null;
        _mediaSubTitle        = null;
        _mediaPublished       = null;
        _mediaDomain          = null;
        _mediaLink            = null;
        _mediaImage           = null;
        _mediaVisualContent   = null;
        _mediaPlayableContent = null;
        _mediaReadableContent = null;
    }
    function getData(){
        getType();
        getTitle();
        getSubtitle();
        getPublished();
        getDomain();
        getLink();
        getImage();
        getVisualContent();
        getPlayableContent();
        getReadableContent();
    }
    
    function testMinimumDataReq(){
        if((_mediaType != null) && (_mediaTitle != null) && (_mediaPublished != null) && (_mediaDomain != null) && (_mediaLink != null) && (_mediaImage != null)){
            _isMediaValid = true;   
        }else{
            console.log("type= "+_mediaType);
            console.log("title= "+_mediaTitle);
            console.log("subtitle= "+_mediaSubTitle);
            console.log("published= "+_mediaPublished);
            console.log("domain= "+_mediaDomain);
            console.log("link= "+_mediaLink);
            console.log("image= "+_mediaImage);
        }
    }
    
    
	// public functions --------------------------------------------------------
    
    _this.getMedia = function (){
        return {mediaType:	         _mediaType,
		        mediaTitle:          _mediaTitle,
                mediaSubTitle:       _mediaSubTitle,  
                mediaPublished:      _mediaPublished,
                mediaDomain:         _mediaDomain,
                mediaLink:           _mediaLink,
                mediaImage:          _mediaImage,   
                mediaVisualContent:  _mediaVisualContent, 
                mediaPlayableContent:_mediaPlayableContent,
                mediaReadableContent:_mediaReadableContent};
    }
    
    _this.isMediaValid = function (){
        testMinimumDataReq();
        return _isMediaValid;
    }
	
	return _this;
}());
document.addEventListener("DOMContentLoaded", function (){ MetaData.init(); }, false);
