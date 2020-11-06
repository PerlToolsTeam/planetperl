$(document).ready(function() {
  $(document).keypress(function(e) {
    switch (e.which) {
      case 110:
        next_div();
        break;
      case 112:
        prev_div();
        break;
    }
  });

  $('.arrow-up').click(function() {
    move_to($(this).parent().parent().parent.prev);
  });
  $('.arrow-down').click(function() {
    move_to($(this).parent().parent().parent().next);
  });
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
