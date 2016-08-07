//jquery is global from cdn

//submit fn - get guest

//form submit function - rsvp
//make props for guest object : diet, status

$(document).ready(function(){
  var code = window.location.pathname.split('/').pop();
  $.get( "/api/guest/" + code, function(data) {
    populateForm(data)
  }).fail(function(){
    $('#form-content').html('Sorry, it looks like there was a problem.  Please try again');
  })
});


function populateForm(guests){
  var contentDiv = $('#form-content');
  if (guests.length < 1) {
    contentDiv.html('Sorry, we could not find any guests with that code.  Please try again.');
  }
  else {
    contentString = 'You may RSVP for the following guests: ';
    var guestContent = guests.reduce(function(content, guest, idx){
      return content + generateFormContent(guest, idx);
    }, contentString);
    guestContent += '<input type="button" id="submit" value="Submit"></input>';
    contentDiv.html(guestContent);
    $('#submit').click(submitData);
  }
}

function populateGuestData(guest, idx) {

  return (
    `<div style='padding:10px 0;'>
      <h3>${guest.name}</h3>
      <div>
          <input type="hidden" name="id" value=${guest.id}>
          <label style='padding-right: 20px;'>Will you be attending?</label>
          <input type="radio" name="status${idx}" value="yes"` + (guest.status === 'yes' ? `checked>` : `>`) + `
          <label style='padding-right: 20px;''>Yes</label>
          <input type="radio" name="status${idx}" value="no"` + (guest.status === 'no' ? `checked>` : `>`) + `
          <label>Regretfully, no</label>
          <input type="radio" name="status${idx}" value="null" style='display:none;'` + (guest.status !== 'no' && guest.status !== 'yes' ? `checked>` : `>`) + `
      </div>
      <div>
          <label style='padding-right: 20px;'>Dietary Restrictions</label>
          <input type="text" name="diet" value=${guest.diet ? guest.diet : ''}>
      </div>
  </div>`
  );
}

function generateFormContent(guest, idx){
  // if (guest.status === 'no' && lastEdited) {
  //   return (
  //     `<div id=${i.toString()}>
  //       <p>${guest.name}</p>
  //       <div>
  //         Sorry, it looks like you already said you weren't coming.  If you want to change this, please email Chris at chris.thomas@gmail.com
  //       </div>`
  //   );
  // }
  // else 
    return populateGuestData(guest, idx);
}

function submitData(){
  var formData = $('#rsvp-form').serializeArray();
  var formattedData = []

  for (var i = 0; i < formData.length; i+=3){
    formattedData.push({
      id: formData[i].value,
      status: formData[i+1].value,
      diet: formData[i+2].value
    })
  }
  $.post("/api/rsvp", {guests: formattedData}, function(data) {
    var message = data === 'Accepted' ? 'Thanks for RSVP-ing!' : 'Oops, it looks like there was a problem, and some of your data might not have been processed.  Please refresh the page and try again.';
    $('#form-content').html(message);
  }).fail(function(){
    $('#form-content').append('Oops, it looks like there was a problem, and some of your data might not have been processed.  Please refresh the page and try again.')
  })

}