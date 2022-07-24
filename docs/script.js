$(document).ready(function() {

  $('#show').click(function() {
    $('.card-body').show();
  });

  $('#hide').click(function() {
    $('.card-body').hide();
  });

  $(document).keypress(function(e) {
    switch (e.which) {
      case 104:
        $('.card-body').hide();
        setCookie('showhide', 'hide', 1000);
        break;
      case 110:
        next_div();
        break;
      case 112:
        prev_div();
        break;
      case 115:
        $('.card-body').show();
        setCookie('showhide', 'show', 1000);
        break;
    }
  });

  $('.arrow-up').click(function() {
    move_to($(this).parent().parent().parent.prev);
  });
  $('.arrow-down').click(function() {
    move_to($(this).parent().parent().parent().next);
  });


  var showhide = getCookie('showhide');
  if (showhide == 'hide') {
    $('.card-body').hide();
  }
});

function get_curr_card() {
  var all_cards = $('.card');
  var prev_card = all_cards[0];

  for (var i = 0; i < all_cards.length; i++) {
    if (all_cards[i].offset.top > 0) {
      break;
    }
    prev_card = all_cards[i];
  }

  return prev_card;
}

function move_to(elem) {
  alert('Move to: ' + elem);
  $(document).scrollTop(elem.offset.top - $('nav').height());
}

function next_div() {
  var card = get_curr_card().next();
  move_to(card);
}

function prev_div() {
  var card = get_curr_card().prev();
  move_to(card);
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

