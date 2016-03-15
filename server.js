var fs = require('fs'),
  path = require('path'),
  async = require('async'),
  nemu = require('nemu')(),
  is = require('is_js');
var express = require('express'),
  app = express(),
  bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var nodeUuid = require('node-uuid');
var server = require('http').Server(app);
var io = require('socket.io')(server);

var results = require(path.join(__dirname, 'libs/results.js'))();
var scraper = require('leagues').scraper();
var excel = require('leagues').excel();

process.on('uncaughtException', (err) => {
  console.log(err);
});

scraper.on('progress', function(stat) {
  io.emit('progress', stat);
  console.log('Progress', stat);
});

scraper.on('starting', function(info) {
  io.emit('starting', info);
  console.log('Starting', info);
});

scraper.on('initializing', function(info) {
  io.emit('initializing', info);
  console.log('initializing', info);
});

scraper.on('scraping', function(info) {
  io.emit('scraping', info);
  console.log('scraping', info);
});

scraper.on('done', function(info) {
  io.emit('done', info);
  console.log('done', info);
});

nunjucks.configure('views', {
  autoescape: true,
  express: app
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', function(req, res) {
  results.list().then(function(files) {
    res.render('index.html', {
      files: files
    });
  });
});

app.get('/results/:file', function(req, res) {
  // TODO: handle if file not exists/
  res.download(path.join(__dirname, 'results', req.params.file));
});

app.post('/', function(req, res) {
  if (req.body) {
    // TODO: Find more elegant way to parse and validate body request.
    var leagues = [],
      output = null,
      id = nodeUuid.v1();

    if (is.string(req.body.league))
      leagues.push({league: req.body.league, order: setOrder(req.body.league)});
    else if (is.array(req.body.league)) {
      req.body.league.forEach(function(item) {
        leagues.push({league: item, order: setOrder(item)});
      });
    }

    output = req.body.output === 'json' ? 'json' : 'xls';

    var filename = output === 'xls' ? path.join(__dirname, 'results/', id + '.xlsx') :
      path.join(__dirname, 'results/', id + '.json');

    scraper.scrape(id, leagues).then(function(scrapeRes) {
      if (output === 'xls') {
        excel.generate(scrapeRes.results, filename).then(function(excelResult) {
          res.contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.download(filename);
        });
      } else {

      }
    });
  } else {
      res.redirect('/');
  }
});

function Server() {}

function setOrder(league) {
    var order = 1;

    if (league === 'la-liga')
      order = 1;
    else if (league === 'premier')
      order = 2;
    else if (league === 'serie-a')
      order = 3;
    else if (league === 'bundesliga')
      order = 4;

    return order;
}

module.exports = function() {
  return new Server();
};

Server.prototype.start = function(cb) {
  var resultsDir = path.join(__dirname, 'results');

  nemu.dir(resultsDir).then(function(exists) {
    fs.mkdir(resultsDir, function(err) {
      server.listen(3000, function() {
        cb();
      });
    });
  }).catch(function(err) {
    //TODO: handle this error.
  });
};
