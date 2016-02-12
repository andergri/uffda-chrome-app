var ParseData = (function (){

	// variables ----------------------------------------------------------------
	var _this		= {};
    var User = Parse.Object.extend("User", {
    });

    var Relationship = Parse.Object.extend("Relationship", { 
    });  
    
    var Share = Parse.Object.extend({
      className: "Share"
    });
    var Shareplatfrom = Parse.Object.extend({
      className: "Shareplatfrom"
    });
    
    var Media = Parse.Object.extend({
      className: "Media"
    });

    var Relationships = Parse.Collection.extend({
      model: Relationship
    });
    var Users = Parse.Collection.extend({
      model: User
    });
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		// create the main container
        Parse.initialize("2WQkKlufhKEO5l3HxrK1BzzfItkIEgaxlCHskSr7", "vB2uYEo5TpflFWJtdJ4Hrnj0BXfhvSuze3E3CzPC");
	};
	
	// parse functions --------------------------------------------------------
    
    function isValidEmailAddress(emailAddress) {
        var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
        return pattern.test(emailAddress);
    };
    
    function shortenUrl(url){
        
        var seconds = (new Date() / 1000).toString();
        var rand = (Math.floor(Math.random() * 1000)).toString() + seconds;
        var enc = window.btoa(url);
        console.log('random '+ rand);
        
        i = Math.round(parseInt(rand));
        var s = "";
        var alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        
        while(i > 0){
            var offRem = Math.round([i % 62]);
            console.log("random = "+ offRem);
            s += alpha.substring(offRem, offRem + 1);
            i = Math.round(i / 62);
            
            console.log("random parse.js "+ s);
        } 
        return s;
    };
    
    function sendPushNotification (toUser){ 
        
        var pushQuery = new Parse.Query(Parse.Installation);
        pushQuery.equalTo('owner', toUser);
        
        var current = Parse.User.current();
        
        Parse.Push.send({
            where: pushQuery,
            data: {
                alert: "New message from "+current.get('username'),
                badge: "Increment"
            }
        }, {
        success: function() {
            // Push was successful
            console.log("parseData push success");
        },
        error: function(error) {
            // Handle error
            console.log("parseData push error"+error);
        }
        });
    };
    
	_this.relationships = function (){		
		// Create our collection of Relationships
        console.log("parseData relationships start");
            var relationships = new Relationships();
            
            var queryIni = new Parse.Query(Relationship);
            queryIni.equalTo("relationshipInitiator", Parse.User.current());
            queryIni.equalTo("relationshipStatusType", "friends");
 
            var queryRec = new Parse.Query(Relationship);
            queryRec.equalTo("relationshipReceiver", Parse.User.current());
            queryRec.equalTo("relationshipStatusType", "friends");
 
            relationships.query = Parse.Query.or(queryIni, queryRec);
            relationships.query.include("relationshipInitiator");
            relationships.query.include("relationshipReceiver");
            
            relationships.fetch({
                success: function(relationships) {
                    console.log("parseData relationships success");
                    rel = [];
                    relationships.each( function( relationship ){
                        if(relationship.get("relationshipInitiator").id != Parse.User.current().id){
                            user = relationship.get("relationshipInitiator");
                        }else{
                            user = relationship.get("relationshipReceiver");
                        }
                        rel.push({username: user.get('username'), thumbnail: user.get('thumbnail'), objectId: user.id, type: "Parse" });
                    });
                    Background.addRelationships(rel);
                },
                error: function(collection, error) {
                    console.log("parseData relationships error");
                }
            });
	};
	
	_this.login = function (username, password){
		Parse.User.logIn(username, password, {
                success: function(user) {
                    console.log("parseData login success");
                    Background.userLoginSuccess();
                },
                error: function(user, error) {
                    console.log("parseData login failed");
                    Background.userLoginFailed();
                }
        });
	};
    
    _this.saveGmailToken = function(token){
        Parse.User.current().set("gmailOAuth", token);  
        Parse.User.current().save(null, {
          success: function(user) {
            // This succeeds, since the user was authenticated on the device
              console.log("parse.js saved gmail token");
          }
        });
    }
    
    _this.gmailIsSupported = function(){
        if(Parse.User.current().get("gmailOAuth") != null && Parse.User.current().get("gmailOAuth").length > 0){
            return true;
        }else{
            return false;
        }
    }
    
    _this.logout = function(){
        Parse.User.logOut();
    };
    
    _this.isLogin = function(){
        var currentUser = Parse.User.current();
        if (currentUser) {
            console.log("parse.js isLogin true");
            return true;
        } else {
            console.log("parse.js isLogin false");
            return false;
        }
    };
    
    _this.create = function (content, usersIds, comment){
        
        console.log("parse.js: create"+content.mediaDomain);
        console.log("parse.js: create"+content.mediaImage);
        
        // test the media to make sure content is filled properly
        var media = new Media();
        media.set("mediaType", content.mediaType);
        media.set("mediaTitle", content.mediaTitle);
        media.set("mediaSubtitle", content.mediaSubTitle);
        media.set("mediaPublished", (content.mediaPublished).toString());
        media.set("mediaDomain", content.mediaDomain);
        media.set("mediaLink", content.mediaLink);
        media.set("mediaImage", content.mediaImage.toString());
        media.set("mediaVisualContnet", content.mediaVisualContent);
        media.set("mediaPlayableContent", content.mediaReadableContent);
        media.set("mediaReadableContent", content.mediaPlayableContent);
            
        $.each(usersIds, function( index, userId ) {

            if( isValidEmailAddress( userId ) ) {
            
                    var shareplatfrom = new Shareplatfrom();
                    shareplatfrom.set("sharePlatfromShortURL", shortenUrl(content.mediaLink));
                    shareplatfrom.set("sharePlatfromContactDetails", userId);
                    shareplatfrom.set("sharePlatfromContactName", userId);
                    shareplatfrom.set("sharePlatfromType", "email");
                    shareplatfrom.set("sharePlatfromFrom", Parse.User.current());
                    shareplatfrom.set("sharePlatfromMedia", media);
                    shareplatfrom.set("sharePlatfromComment", comment);
                    shareplatfrom.set("sharePlatfromVisited", null);

                    shareplatfrom.save(null, {
                        success: function(shareplatfrom) {
                            console.log("parse.js successus, shared with " + shareplatfrom.id);
                        },
                        error: function(share, error) {
                            console.log("parse.js error saving"+error.message);
                            Background.errorSavingContent();
                        }
                    });       
                
            }else{
             
                if(userId != Parse.User.current().id){
                    var query = new Parse.Query(User);
                    query.get(userId, {
                        success: function(userFound) {

                            console.log("parse.js success first, got user");

                            console.log("parse.js to"+userFound.objectId);
                            console.log("parse.js from"+Parse.User.current());
                            console.log("parse.js media"+media);

                            var share = new Share();
                            share.set("shareTo", userFound);
                            share.set("shareFrom", Parse.User.current());
                            share.set("shareMedia", media);
                            share.set("shareComment", comment);
                            share.set("shareVisited", null);

                            share.save(null, {
                                success: function(share) {
                                    console.log("parse.js successus, shared with " + share.id);
                                    sendPushNotification(userFound);
                                },
                                error: function(share, error) {
                                    console.log("parse.js error saving"+error.message);
                                    Background.errorSavingContent();
                                }
                            }); 
                        },
                        error: function(object, error) {
                            console.log("parse.js error saving, worng id"+error.message);
                            Background.errorSavingContent();
                        }
                    });
                }
            }
        });
    };
	
	return _this;
}());
document.addEventListener("DOMContentLoaded", function (){ ParseData.init(); }, false);