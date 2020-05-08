var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/top', async function (req, res, next) {

  req.ton.queries.accounts.query({
    workchain_id: { eq: req.session.workchain_id }
  }, 'id balance acc_type last_paid', [{ path: 'balance', direction: 'DESC' }], 100)
    .then((data) => {

      console.log(data);
      res.render('accounts/top', { title: 'Top account balances', accounts: data });
    })

});

module.exports = router;
