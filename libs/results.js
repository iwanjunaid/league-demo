var fs = require('fs'),
  path = require('path'),
  async = require('async'),
  util = require('util'),
  moment = require('moment'),
  _ = require('lodash');

function Results() {}

module.exports = function() {
  return new Results();
}

Results.prototype.list = function(orderByDate) {
  return new Promise(function(resolve, reject) {
    var resultsDir = path.join(__dirname, '../', 'results');
    var list = [];

    fs.readdir(resultsDir, function(rdErr, files) {
      async.each(files, function(file, fileCb) {
        var absolutePath = path.join(__dirname, '../', 'results/', file);

        fs.stat(absolutePath, function(statErr, fileStat) {
          if (statErr)
            return fileCb(statErr);

          if (fileStat.isFile()) {
            var item = {
              fileName: file,
              lastModified: moment(fileStat.mtime).format('YYYY-MM-DD HH:mm:ss')
            };

            list.push(item);
            fileCb(null);
          } else {
            fileCb(null);
          }
        });
      }, function(err) {
        if (err)
          return reject(err);

        list = _.sortBy(list, 'lastModified');
        resolve(_.reverse(list));
      });
    });
  });
};
