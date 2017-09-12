var polo = require("poloniex-unofficial");
var querystring = require('querystring');
var https = require('https');

module.exports = {

  login: function (req, res) {

    // See `api/responses/login.js`
    return res.login({
      email: req.param('email'),
      password: req.param('password'),
      successRedirect: '/welcome',
      invalidRedirect: '/'
    });
  },

  logout: function (req, res) {

    // "Forget" the user from the session.
    // Subsequent requests from this user agent will NOT have `req.session.me`.
    req.session.me = null;

    // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
    // send a simple response letting the user agent know they were logged out
    // successfully.
    if (req.wantsJSON) {
      return res.ok('Logged out successfully!');
    }

    return res.redirect('/');
  },

  signup: function (req, res) {

    User.signup({
      name: req.param('name'),
      email: req.param('email'),
      password: req.param('password')
    }, function (err, user) {
      
      if (err) return res.negotiate(err);
      req.session.me = user.id;

      // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
      // send a 200 response letting the user agent know the signup was successful.
      if (req.wantsJSON) {
        return res.ok('Signup successful!');
      }

      // Otherwise if this is an HTML-wanting browser, redirect to /welcome.
      // return res.redirect('https://www.coinbase.com/oauth/authorize?client_id=ac986a679012a3a40b19775b01948740cbe1546ac0eff7fadba16fe8c46257b5&redirect_uri=http%3A%2F%2Flocalhost%3A1337%2Fcbconnect&response_type=code&scope=wallet%3Auser%3Aread');
       return res.redirect('/welcome');
    });
  },

  autoCoinbase: function (req, res) {
     // return res.ok(req.param.code);
     console.log('autoCoinbase Active');
     if(req.param('code'))
     {
       var str = '';
       var data = querystring.stringify({
          grant_type: 'authorization_code',
          code: req.param('code'),
          client_id: 'ac986a679012a3a40b19775b01948740cbe1546ac0eff7fadba16fe8c46257b5',
          client_secret: '0f7acac17decdf7cfcdfb7dc81214311c0b8892eb0903d6ca3f720c0d326e41f',
          redirect_uri: 'http://localhost:1337/cbconnect'
       });
      
       var options = {
          host: 'api.coinbase.com',
          path: '/oauth/token',
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          }
       };

       var http_req = https.request(options, function(http_res) {
          http_res.setEncoding('utf8');
          http_res.on('data', function (chunk) {
              str += chunk;
          });

          http_res.on('end', function () {
            var json_req = JSON.parse(str);
            console.log('refresh_accessToken:',json_req.access_token);
            console.log('refresh_refreshToken:',json_req.refresh_token);
            req.session.accessToken = json_req.refresh_token;
            req.session.refreshToken = json_req.refresh_token;
            //Get Request
            var get_str = '';
            var get_json_req = '';
            var get_options = {
                host: 'api.coinbase.com',
                path: '/v2/user',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + json_req.access_token
                }
            };

            var get_http_req = https.request(get_options, function(http_res) {
                http_res.setEncoding('utf8');
                http_res.on('data', function (chunk) {
                    get_str += chunk;
                });
                http_res.on('end', function () {
                  get_json_req = JSON.parse(get_str);
                  console.log('AutoId:',get_json_req.data.id);
                  req.session.auto_userId = get_json_req.data.id;
                });
            });

            get_http_req.end();
          });
       });

       http_req.write(data);
       http_req.end();
       return res.redirect('/welcome');
    } else
    {
       return res.ok('No code');
    }
  },
};

