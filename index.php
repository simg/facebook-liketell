<?php
$app_id = '000000000000000';
$app_namespace = 'liketell';
?>
<!DOCTYPE html>
<html>
<head>
<title>Like Tell - Everything your friends have ever liked on Facebook</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta property="fb:app_id" content="<?php echo $app_id ?>"/>
<meta property="fb:admins" content="503862563" />
<meta property="og:url" content="https://facebook.holisticsystems.co.uk/liketell/"/>
<meta property="og:type" content="website"/>
<meta property="og:image" content="https://facebook.holisticsystems.co.uk/liketell/images/icon_1024.png"/>
<meta property="og:title" content="Facebook Like Tell"/>
<meta property="og:description" content="See everything your friends have ever liked (on Facebook)"/>


<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/async/1.22/async.min.js"></script>

<script src="js/lib/director.min.js"></script>

<!--[if lt IE 8]>
<script src="js/lib/json2.min.js"></script>
<![endif]-->

<?php
if ($_SERVER["REMOTE_ADDR"] == '89.213.26.67') {
  $admin = true;
  print '<script src="script_notmin.js"></script>';
} else {
  $admin = false;
  print '<script src="script.min.js"></script>';
}
?>


<script>
  //google analytics
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-nnnnnnnn-n']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
</script>

<style type="text/css">
    html { height: 100% }
    body { height: 100%; margin: 0; padding: 0; font-family:tahoma, verdana, sans-serif; }

    #controls {margin:4px 0 2px 0; xfloat:left; background:#fff;}
    #controls:after {content:"", clear:both;}

    .fb-like {
      margin:2px 10px 4px 10px;
      float:right;
    }

    #auth_button, #loading, #advmode_enabled {
      display:none; z-index:1000;
      width:380px; height:180px; padding:1em;
      background:#fff; position:absolute; top:35%; left:35%;
      border:3px solid #425F9C; -webkit-border-radius:5px; -moz-border-radius:5px;
    }
    #auth_button .update {
      display:none;
    }
    #stopbutton {margin-left:30px;}

    button {background:#425F9C; color:#fff; font-weight:bold; font-family:Helvetica, Arial, 'lucida grande',tahoma,verdana,arial,sans-serif; padding:4px 10px; border:2px color #425F9C; -webkit-border-radius:5px; -moz-border-radius:5px;}
    h2 {font-size:120%; color:#224; margin-top:0;}
    p, td {font-size:80%; color:#446;}
    .invis {display:none;}

    #footer {position:fixed; bottom:0px; height:15px; background:#fff; z-index:10; width:100%; border-top:2px solid #111; font-size:70%; padding:3px 10px 2px 10px;}
    #footer a {text-decoration:none; color:#222;}
    #footer a:hover {text-decoration:underline;}
    .menu {margin:0; padding:0; float:right;}
    .menu LI {float:left; margin-right:30px;}
    .menu a {text-decoration:none; color:#222;}
    .menu a:hover {text-decoration:underline;}

    #content {width:80%; margin:0 auto; margin-bottom:40px;}
    #content table {width:100%;}
    #content table a.url {max-width:700px; overflow-x:hidden; display:block; text-decoration:none; color:#222;}
    #content table a.url:hover {text-decoration:underline;}
</style>
</head>
<body>

  <div id="fb-root"></div>
  <script>
  $(document).ready(function() {
    $.ajaxSetup({ cache: true });
    app_init({id:<?php echo $app_id ?>});
  });
  </script>
  <p class="invis">Quickly and simply display the currently published locations of all your friends. Shows current location, current address and home town depending on the privacy settings of your friends. Allows filtering of friends by sex and relationship status.</p>
  <div id="auth_button">
   <h2>Like Tell</h2>
   <p class="new">requires authorisation from Facebook to access your data.</p>
   <p class="update">requires additional authorisation from Facebook as a result of a software update.</p>
   <button>Continue</button>
   <p>you will be redirected to the Facebook authorisation screen. This is perfectly safe, we do not store or do anything untoward with your data.</p>
  </div>

  <div id="loading">
    <h2>Where are they now</h2>
    <p>Loading data from facebook ...</p>
    <p><img src="images/ajax-loader.gif" /></p>
    <span id="progress_count">Request: 0</span><button id="stopbutton" onclick="stop_click();">Stop!</button>
    <span id="loading_msg"></span>
    <p>If you like this app, please help support future development by clicking Like or Share in the top right corner.</p>
  </div>

  <div id="advmode_enabled">
    <h2>Advanced Mode Enabled ...</h2>
  </div>

   <div id="controls">

   </div>

  <div class="fb-like" data-href="https://apps.facebook.com/liketell/" data-layout="button_count" data-action="like" data-show-faces="false" data-share="true"></div>

  <div id="content">
  </div>


<div id="footer">
  <ul class="menu">
    <li><a href="https://www.facebook.com/liketell" target="_blank">Discuss this app</a></li>
    <li><a href="terms.html" target="_blank">Terms & Conditions</a></li>
    <li><a href="privacy-policy.html" target="_blank">Privacy Policy</a></li>
  </ul>
  <a href="http://holisticsystems.co.uk" target="_blank">&copy; Holistic Systems 2014</a>
</div>

  </body>
</html>
