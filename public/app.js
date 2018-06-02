$.getJSON('/articles', function(data) {
  for (var i = 0; i < data.length; i++) {
    $('#articles').append(
      '<h3 data-id="' + data[i]._id + '">' + data[i].title + '</h3>'
    );
    $('#articles').append('<p>' + data[i].summary + '</p>');
  }
});

$(document).on('click', 'h3', function() {
  $('#notes').empty();
  var thisId = $(this).attr('data-id');

  $.ajax({
    method: 'GET',
    url: '/articles/' + thisId
  }).done(function(data) {
    console.log(data);
    $('#notes').append('<h3>' + data.title + '</h3>');
    $('#notes').append(
      '<input id="titleinput" name="title" placeholder="Note Title" >'
    );
    $('#notes').append(
      '<textarea id="bodyinput" name="body" placeholder="Add a note!"></textarea>'
    );
    $('#notes').append(
      '<button data-id="' + data._id + '" id="savenote">Save Note</button>'
    );

    if (data.note) {
      $('#titleinput').val(data.note.title);
      $('#bodyinput').val(data.note.body);
    }
  });
});

$(document).on('click', '#savenote', function() {
  var thisId = $(this).attr('data-id');

  $.ajax({
    method: 'POST',
    url: '/articles/' + thisId,
    data: {
      title: $('#titleinput').val(),
      body: $('#bodyinput').val()
    }
  }).done(function(data) {
    console.log(data);
    $('#notes').empty();
  });

  $('#titleinput').val('');
  $('#bodyinput').val('');
});
