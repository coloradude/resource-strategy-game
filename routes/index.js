var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});

router.use('/build', express.static('build'));
router.use('/public', express.static('public'));

module.exports = router;
