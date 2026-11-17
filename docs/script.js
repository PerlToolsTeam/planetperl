$(document).ready(function() {

  $('#toggle-articles').click(toggle_article_visibility);

  $('#next').click(next_div);
  $('#prev').click(prev_div);

  $(document).keydown(function(e) {
    if (e.ctrlKey || e.altKey || e.metaKey ||
        $(e.target).closest('input, textarea, select, [contenteditable]').length) {
      return;
    }

    switch (e.key) {
      case 'h':
      case 's':
        toggle_article_visibility();
        break;
      case 'n':
        next_div();
        break;
      case 'p':
        prev_div();
        break;
      default:
        return;
    }
    e.preventDefault();
  });

  set_article_visibility(!document.documentElement.classList.contains('hide-articles'), false);

  // Get list of checkboxes by their class name
  var checkboxes = $('.feed-checkbox');

  // Create a single object called 'planet_perl' to store all feed display statuses
  var planetPerl = JSON.parse(localStorage.getItem('planet_perl')) || {};

  // On page load, if there isn't a key called 'planet_perl', create one, copy the values from the existing keys, and delete those existing keys
  if (!localStorage.getItem('planet_perl')) {
    checkboxes.each(function() {
      var checkboxId = $(this).attr('id');
      var checkboxValue = localStorage.getItem(checkboxId);
      if (checkboxValue !== null) {
        planetPerl[checkboxId] = checkboxValue;
        localStorage.removeItem(checkboxId);
      } else {
        planetPerl[checkboxId] = "true";
      }
    });
    localStorage.setItem('planet_perl', JSON.stringify(planetPerl));
  }

  // Loop through each checkbox and check localStorage for its value
  checkboxes.each(function() {
    var checkboxId = $(this).attr('id');
    var checkboxValue = planetPerl[checkboxId];

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
      planetPerl[checkboxId] = "true";
      $(this).prop('checked', true);
      $('.' + checkboxId).show();
    }
  });

  // Update the 'planet_perl' object in local storage when a checkbox is clicked
  checkboxes.on('click', function() {
    var checkboxId = $(this).attr('id');
    var checkboxValue = $(this).prop('checked');

    planetPerl[checkboxId] = checkboxValue.toString();
    localStorage.setItem('planet_perl', JSON.stringify(planetPerl));

    if (checkboxValue === true) {
      $('.' + checkboxId).show();
    } else {
      $('.' + checkboxId).hide();
    }
  });

  // Set the "All Feeds" checkbox to checked when the page loads
  $('#all-feeds').prop('checked', true);

  // Add event listener for "All Feeds" checkbox
  $('#all-feeds').click(function() {
    var isChecked = $(this).prop('checked');
    $('.feed-checkbox').each(function() {
      $(this).prop('checked', isChecked);
      planetPerl[$(this).attr('id')] = isChecked.toString();
      if (isChecked) {
        $('.' + $(this).attr('id')).show();
      } else {
        $('.' + $(this).attr('id')).hide();
      }
    });
    localStorage.setItem('planet_perl', JSON.stringify(planetPerl));
  });

});

function toggle_article_visibility() {
  set_article_visibility(document.documentElement.classList.contains('hide-articles'));
}

function set_article_visibility(show, remember) {
  document.documentElement.classList.toggle('hide-articles', !show);
  var label = show ? 'Hide articles' : 'Show articles';
  var shortcut = show ? 'h' : 's';
  $('#toggle-articles').attr({
    'aria-expanded': show.toString(),
    'aria-label': label,
    'aria-keyshortcuts': shortcut
  });
  $('#toggle-articles .action-label').text(label);
  $('#toggle-articles kbd').text(shortcut);
  if (remember !== false) {
    setCookie('showhide', show ? 'show' : 'hide', 1000);
  }
}

function get_curr_card() {
  var all_cards = $('.card:visible');
  var prev_card = all_cards.first();
  var nav_bottom = $('nav')[0].getBoundingClientRect().bottom;

  for (var i = 0; i < all_cards.length; i++) {
    if (all_cards[i].getBoundingClientRect().top > nav_bottom + 1) {
      break;
    }
    prev_card = all_cards[i];
  }

  return $(prev_card);
}

function move_to(elem) {
  if (elem.length) {
    window.scroll(0, elem.offset().top - $('nav')[0].getBoundingClientRect().bottom);
  }
}

function next_div() {
  var curr = get_curr_card();
  move_to(curr.nextAll('.card:visible').first());
}

function prev_div() {
  var curr = get_curr_card();
  move_to(curr.prevAll('.card:visible').first());
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
