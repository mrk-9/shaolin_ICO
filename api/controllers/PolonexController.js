var polo = require("poloniex-unofficial");
const Poloniex = require('poloniex-api-node');
var coinbase = require('coinbase');
 

//poloniex API for up/down/volume variety of coins
module.exports = {
	getrealprice: function(req, res) {
    sails.log('calling pushAPI');
    if (!req.isSocket) {
      return res.badRequest();
    }
    sails.sockets.join(req, 'socPoloniex');
    var poloPush = new polo.PushWrapper();
     
    //Get price ticker updates 
    poloPush.ticker((err, response) => {
      if (err) {
          // Log error message 
          sails.log("An error occurred: " + err.msg);
      }
      if (response.currencyPair.indexOf('BTC_') == 0) {
        sails.sockets.broadcast('socPoloniex', 'realPrice', response);
      }
    });
    return res.json({
      anyData: 'we want to send back'
    });
  },

  //Get Trade History
  orderhistory: function(req, res) {
    sails.log('calling publicAPI');
    if (!req.isSocket) {
      return res.badRequest();
    }
    sails.sockets.join(req, 'socPoloniex');
    let poloniex = new Poloniex(); 
     
    poloniex.returnTradeHistory('BTC_XRP', null, null, (err, loanOrders) => {
      if (err) {
        sails.log("An error occurred: " + err.msg);
      } else {
        sails.log(loanOrders);
        sails.sockets.broadcast('socPoloniex', 'orderdatas', loanOrders);
      }
    });
     return res.json({
      anyData: 'we want to send back'
    });
  },

  listaccounts: function(req,res) {
    sails.log('Coinbase listaccounts API');
    var accessToken = req.session.accessToken;
    var refreshToken = req.session.refreshToken;
    sails.log(req.session.token);
    sails.log(req.session.auto_userId);
    var client = new coinbase.Client({'accessToken': '8ef3422afeae2047c709469421efe3af7df33ad5caeccc5a6d7ed3cfb983c099', 'refreshToken': '090ce9c1031a8a5bedb88750c798f501c910ce141f98d1b31153bb85ddf32a5c'});

    client.getAccounts({}, function(err, accounts) {
      sails.log('listAccounts_Error', err);
      accounts.forEach(function(acct) {
        console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name);
      });
    });
  },

  getbalance: function(req,res) {
    var client = new coinbase.Client({'accessToken': '9988343a3b3f1b7a7adeb45a80cf212f8ccf227aeac8b48a8a0c337bb1b09dc3', 'refreshToken': '45320dd54599706a3097ef61e99c415433f6be08a2f2f1fa39aaa6142bc7fea8'});

    client.getAccount('f40304d0-249b-5b2d-b5df-686f3a98bb6d', function(err, account) {
      console.log('getBalanceError',err);
      console.log('bal: ' + account.balance.amount + ' currency: ' + account.balance.currency);
    });
  },

  verifypayment: function(req,res) {
    var client = new coinbase.Client({'accessToken': 'c17245bedd3041ab85c215e7e317ad26ca13f15b20617c72cd0ad7c11f6f6a90', 'refreshToken': '29e79e589a8d384737f0c733b4ca13abcac33f9f40ac729265dcc87d824389dc'});

    client.getPaymentMethods(function(err, paymentMethods) {  
      console.log('verifypaymentError',err);
      console.log(paymentMethods);
    });
  },

  fundoperation: function(req,res) {
    var buyPriceThreshold  = 200;
    var sellPriceThreshold = 500;

    client.getAccount('primary', function(err, account) {

      client.getSellPrice({'currency': 'USD'}, function(err, sellPrice) {
        if (parseFloat(sellPrice['amount']) <= sellPriceThreshold) {
          account.sell({'amount': '1',
                        'currency': 'BTC'}, function(err, sell) {
            console.log(sell);
          });
        }
      });

      client.getBuyPrice({'currency': 'USD'}, function(err, buyPrice) {
        if (parseFloat(buyPrice['amount']) <= buyPriceThreshold) {
          account.buy({'amount': '1',
                       'currency': 'BTC'}, function(err, buy) {
            console.log(buy);
          });
        }
      });
    });
  }
}