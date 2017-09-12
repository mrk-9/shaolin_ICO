var polo = require("poloniex-unofficial");
module.exports.routes = {

  // HTML Views
  '/': { view: 'homepage' },
  'get /login': { view: 'user/login' },
  'get /signup': { view: 'user/signup' },
  '/welcome': { view: 'user/welcome' },
  '/transactions': { view: 'user/transactions' },
  '/receive-address': { view: 'user/Accountaddress' },
  '/transactions-send': { view: 'user/transactionsSend' },
  // Endpoints
  'get /poloniex': 'PolonexController.getrealprice',
  'get /verifypayment': 'PolonexController.verifypayment',
  'get /orderhistory': 'PolonexController.orderhistory',
  'get /listaccounts': 'PolonexController.listaccounts',
  'get /getbalance': 'PolonexController.getbalance',
  'post /login': 'UserController.login',
  'post /signup': 'UserController.signup',
  '/logout': 'UserController.logout',
  'get /cbconnect': 'UserController.autoCoinbase'
};
