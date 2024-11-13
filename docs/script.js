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
        console.log('n');
        next_div();
        break;
      case 112:
        console.log('p');
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

  // Get list of checkboxes by their class name
  var checkboxes = $('.feed-checkbox');

  // Loop through each checkbox and check localStorage for its value
  checkboxes.each(function() {
    var checkboxId = $(this).attr('id');
  
    // Check if checkbox id exists in localStorage and get its value
    var checkboxValue = localStorage.getItem(checkboxId);
  
    // If the checkbox value exists and is true, check the checkbox
    if (checkboxValue === "true") {
      $(this).prop('checked', true);
      $('.' + checkboxId).show();
    } 
    // If the checkbox value exists and is false, uncheck the checkbox
    else if (checkboxValue === "false") {
      $(this).prop('checked', false);
      $('.' + checkboxId).hide();
    } 
    // If the checkbox value doesn't exist, add it to localStorage and check the checkbox
    else {
      localStorage.setItem(checkboxId, "true");
      $(this).prop('checked', true);
      $('.' + checkboxId).show();
    }
  });
  
  // Update localStorage when a checkbox is clicked
  checkboxes.on('click', function() {
    var checkboxId = $(this).attr('id');
    var checkboxValue = $(this).prop('checked');
  
    localStorage.setItem(checkboxId, checkboxValue);

    if (checkboxValue === true) {
      $('.' + checkboxId).show();
    } else {
      $('.' + checkboxId).hide();
    }
  });

  // Add event listener for "All Feeds" checkbox
  $('#all-feeds').click(function() {
    var isChecked = $(this).prop('checked');
    $('.feed-checkbox').each(function() {
      $(this).prop('checked', isChecked).trigger('click');
    });
  });

});

function get_curr_card() {
  var all_cards = $('.card');
  var prev_card = all_cards.first();

  for (var i = 0; i < all_cards.length; i++) {
    console.log(all_cards[i].id + ' - ' + all_cards[i].getBoundingClientRect().top + ' (' + $('nav').height() + ')');
    if (all_cards[i].getBoundingClientRect().top > $('nav').height()) {
      console.log('Breaking...');
      break;
    }
    prev_card = all_cards[i];
  }

  return $(prev_card);
}

function move_to(elem) {
  console.log('Moving to: ' + elem[0].id + ' / ' + elem.offset().top + ' + ' + $('nav').height());
  console.log(elem.offset().top + $('nav').height());

  window.scroll(0, elem.offset().top + $('nav').height());
}

function next_div() {
  var curr = get_curr_card();
  if (curr.next().length) {
    move_to(curr.next());
  } else {
    console.log('No next card');
  }
}

function prev_div() {
  var curr = get_curr_card();
  if (curr.prev().length) {
    move_to(curr.prev());
  } else {
    console.log('No previous card');
  }
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

