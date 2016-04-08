
var global_next; //used to resume processing if something happens
var app_id;
function app_init(config) {
  app_id = config.id;
  console.log("Application initialising");

  async.series([
    fb_init,
    fb_get_login_status,
    fb_ensure_authorisation,
    fb_get_likes,
    fb_get_friends,
    app_process_data,
    app_router_init,
    app_render
  ],
  function(err) {
    console.log(err);
    switch(err) {
      case "not authorised":
        $('#auth_button').show();
        break;
      case "user cancelled authorisation":
        //TODO:something?
        break;
    }
  });  
}

//initialise facebook connection
var uid, accessToken;
function fb_init(next) {
  $.getScript('//connect.facebook.net/en_UK/all.js', function(){
    FB.init({
      appId: app_id,
      status:true,
      xfbml:true
    });       
  next();
  });
}

//ensure logged in to facebook
function fb_get_login_status(next) {
  console.log("get login status");
  FB.getLoginStatus(function(response){
    console.log("fb login response", response);
    switch(response.status) {
      case "connected":
        uid = response.authResponse.userID;
        accessToken = response.authResponse.accessToken;
        FB.api('/me', function(response) {
          console.log("logging fb user to analytics",response.name + "-" +uid);
          _gaq.push(['_trackEvent', 'LikeReport', 'loggedin', response.name + "-" +uid]);
        });
        next();
        break;
      case "not_authorized":
        next("not authorised");
        break;
      default:
        next("not logged in");
        break;
    }    
  }); 
}

// generate permissions for the app can use "mode" to return escalated priviledges if required
function app_permissions(mode) {
  return 'user_likes, user_friends, friends_likes';
}

//ensure we have correct permissions for the running the app
function fb_ensure_authorisation(next) {
  console.log("ensure authorisation");
  var fqlRequest = "SELECT "+app_permissions()+" FROM permissions WHERE uid=me()";
  console.log(fqlRequest);
  
  FB.api("/fql",{q:fqlRequest,access_token:accessToken}, function(response){
    var permission; // default
    for (var d in response.data[0]) {
      var permission = response.data[0][d];
      console.log("permission", permission);
      if (!permission) {
        app_request_fb_authorisation(next)
        break; 
      }
    }
    if (permission) {
      $("#auth_button").hide();
      next(); 
    }      
  });
}

//request additional permissions if required
function app_request_fb_authorisation(next) {
  console.log("requesting user authorisation")
  $("#auth_button button").click(function(){
    FB.login(function(response) {
      console.log("login response", response);
      if (response.authResponse) {
        next();
      } else {
        next("user cancelled authorisation")
      }
    }, {scope:app_permissions()}); //, friends_interests, friends_activities  
  });
  $("#auth_button .new").hide();
  $("#auth_button .update").show();
  $("#auth_button").show();  
}

//get all friends like from facebook (requires multiple requests due to fb limiting the number of rows returned per request
function fb_get_likes(next, fqlOffset) { 
  //use previous cached data if available - TODO:some way of flushing / updating the cache
  data = settings.get("data", []);
  if (data.length == 0) {
    $("#loading").show();
    fb_fetch_likes(next, 0);
  } else {
    next();
  }
}

var fb_results_limit = 300;
var data = [], count = 0;
var stopflag = false;
var total = 0;

function fb_fetch_likes(next, fqlOffset) {
  
  if (stopflag) {
    global_next = next;
    console.log("Stopped on user request");
    return;
  }
  count++;
  $("#progress_count").html("Request: "+count);
  
  var fqlRequest = "select user_id, url from url_like where user_id in (select uid2 from friend where uid1 = me()) limit "+fqlOffset+","+fb_results_limit;
  FB.api("/fql",{q:fqlRequest,access_token:accessToken}, function(response){
    if (response.error) {
      $("#loading_msg").html(response.error.message);
    } else {
      console.log("response no="+count+", length="+reponse.data.length);
      data = data.concat(response.data);
      total += response.data.length;
      
      if (response.data.length > 0) {
        //still more data to fetch
        fb_get_likes(next, fqlOffset+fb_results_limit);
      } else {
        settings.set("data", data, true); //cache data to local storage
        next();
      }
    }
  });
}


//TODO: make the stop function more robust
function stop_click() {
  if (stopflag == true) {
    stopflag = false;
    $("#stopbutton").html("Stop!");     
    global_next();
  } else {
    stopflag = true;
    $("#stopbutton").html("Continue!");  
  }
}

//get list of users friends from facebook
var friends_list = {};
function fb_get_friends(next) {
  friends_list = settings.get("friends_list", {});
  if (friends_list.friends == undefined) {
    var fqlRequest = "select uid, name, pic_square, profile_url from user where uid in (select uid2 from friend where uid1 = me())";
    FB.api("/fql",{q:fqlRequest,access_token:accessToken}, function(response){
        console.log(response);
        friends_list.friends = response.data;
        friends_list.idx = {}
        //create index to make access via uid easy
        for (var i=0; i < friends_list.friends.length; i++) {
          friends_list.idx[friends_list.friends[i].uid] = i;
        }
        settings.set("friends_list", friends_list);
        next();
    });
  } else {
    next();
  }
}

//convert facebooks raw json into structured data for output
var urls_ary = [], urls_idx = {}
var users_ary = [], users_idx = {}
var url, uid;
function app_process_data(next) {
  for (var i=0; i < data.length; i++) {
    url = data[i].url;
    uid = data[i].user_id;
    
    //update urls index
    if (!urls_idx[url]) {
      urls_idx[url] = [uid] //create index item for this url and add this user
      urls_ary.push(url);
    } else {
      urls_idx[url].push(uid); // add user to existing index
    }
    
    //update users index
    if (!users_idx[uid]) {
      users_idx[uid] = [url]; //create index item for this url
      users_ary.push(uid);
    } else {
      users_idx[uid].push(url); // add url to existing index 
    }
     
  }

  //sort urls array into most liked first
  urls_ary.sort(function(a,b) {
    return urls_idx[b].length - urls_idx[a].length;
  });
  
  //sort users array into most likes first
  users_ary.sort(function(a,b) {
    return users_idx[b].length - users_idx[a].length;
  });
  
  $("#loading").hide();
  
  next();
}

function app_router_init(next) {
  console.log("initalising application router");
  var routes = {
    '/urls': render_urls,
    '/users': render_users,
    '/books/view/:bookId': render_users
  };

  var router = Router(routes);
  router.init();
  next()
}

function app_render() {
  console.log("total",total);
  console.log("data",data.length);
  render_urls();
}

function generate_menu() {
  return '<ul class="menu"><li><a href="#/urls" >Show Urls</a></li><li><a href="#/users">Show Users</a></li></ul>';
}

function render_urls() {

  var max_items = 1000;
  $("#content").html(generate_menu()+"<table><thead><tr><td>Url</td><td>Likes</td></tr><thead><tbody></tbody></table>");
  var body = $("#content table tbody");
  for (var i=0; (i < urls_ary.length && i < max_items); i++) {
    $(body).append("<tr><td><a class=\"url\" href=\""+urls_ary[i]+"\" target=\"_blank\">"+urls_ary[i]+"</a></td><td>"+urls_idx[urls_ary[i]].length+"</td></tr>");
  }
}

function render_users() {

  var max_items = 1000;
  $("#content").html(generate_menu()+"<table><thead><tr><td>Users</td><td>Urls</td></tr><thead><tbody></tbody></table>");
  var body = $("#content table tbody");
  for (var i=0; (i < users_ary.length && i < max_items); i++) {
    var friend = friends_list.friends[friends_list.idx[users_ary[i]]];
    if (friend) {
      $(body).append("<tr><td><a class=\"url\" href=\"http://facebook.com/"+friend.profile_url+"\" target=\"_blank\"><img src=\""+friend.pic_square+"\" /><span class=\"name\">"+friend.name+"</span></a></td><td>"+users_idx[users_ary[i]].length+"</td></tr>");
    } else {
      console.log("unindexed friend",users_ary[i]);
    }
  }
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (obj, fromIndex) {
    if (fromIndex == null) {
        fromIndex = 0;
    } else if (fromIndex < 0) {
        fromIndex = Math.max(0, this.length + fromIndex);
    }
    for (var i = fromIndex, j = this.length; i < j; i++) {
        if (this[i] === obj)
            return i;
    }
    return -1;
  };
}

settings = {
  // if localStorage available, use that, else use a cookiea
  app_prefix:"liketell/", //prevent namespace collisions with other apps on this domain //TODO: make this more reusable
  get:function(i, def) {
    if (window.localStorage) {
      var val = localStorage.getItem(this.app_prefix+i);
      if (val) {
        return JSON.parse(val);
      } else {
        if (typeof(def) === 'function') {
          return def();
        } else {
          return def;
        }
      }
    } else {
      var val = $.cookie(this.app_prefix+i, {path:this.app_prefix})
      if (val) {
        return JSON.parse(val);
      } else {
        if (typeof(def) === 'function') {
          return def();
        } else {
          return def;
        }
      }
    }
  },
  set:function(i, val, forcelocal) {
    if (window.localStorage) {
      localStorage.setItem(this.app_prefix+i,JSON.stringify(val));  
    } else {
      if (forcelocal) {
        //TODO: do something sensible about this !
      } else {
        $.cookie(i, JSON.stringify(val), {path:this.app_prefix});
      }
    }
  }
}

function utf8_to_b64( str ) {
    var b64=window.btoa(encodeURIComponent( escape( str )))
    return b64.replace(/=/g,'_'); //remove the trailing ='s
}

function b64_to_utf8( str ) {
    return unescape(decodeURIComponent(window.atob( str.replace(/_/g,'=') ))); // put the = back
}
