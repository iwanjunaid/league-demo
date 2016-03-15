$(document).ready(function() {
  // alert(window.location.href);
  var rootUri = window.location.href;
  var socket = io.connect(rootUri);

  socket.on('progress', function(stat) {
    $('#progress-bar').css('width', stat.progress + '%');
    $('#progress-bar').html(stat.progress + '%');
  });

  socket.on('starting', function(stat) {
    $('#text-progress').html('Starting #' + stat + '...');
  });

  socket.on('initializing', function(stat) {
    $('#text-progress').html('Initializing ' + stat.league + '...');
  });

  socket.on('scraping', function(stat) {
    $('#text-progress').html('Scraping ' + stat.league + '...');
  });

  socket.on('done', function(stat) {
    $('#text-progress').html('Done!');

    setTimeout(function() {
      $('#btn-submit').removeClass('disabled');
      $('#text-progress').hide();
      $('#progress-bar-root').hide();

      location.reload();
    }, 3000);
  });

  progressHandler();
});

function progressHandler() {
  $('#btn-submit').click(function() {
    $(this).addClass('disabled');
    $('#text-progress').show();
    $('#progress-bar-root').show();
    // return true;
  });
}
