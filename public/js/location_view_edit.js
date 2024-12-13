$(document).ready(function() {
  $('#applyDateFilterButton').click(function(event) {
      event.preventDefault();

      // Get the selected dates
      const startDate = document.getElementById("filterDateStart").value;
      const endDate = document.getElementById("filterDateEnd").value;
      const url = window.location.pathname;
      const locationId = url.match(/\/([a-f0-9]{24})$/)[1];
      
      const timeline = $('#timeline');
      timeline.empty();

      if (response.array.length === 0) {
        timeline.append("<p>No images found for the selected date range.</p>");
        return;
      }

      const loader = $('<p>Loading...</p>');

      // Send an AJAX request to the server
      $.ajax({
          url: `/${locationId}`, // Replace with your actual endpoint
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
              startDate: startDate,
              endDate: endDate
          }),
          success: function(response) {
            // Update the timeline with the filtered images
            loader.remove();
            if (response.array.length === 0) {
              timeline.append('<p>No images found for the selected date range.</p>');
            }
            
            response.array.forEach(image => {
              timeline.append(`
                <div class="timeline-container">
                  <div class="timeline-text-box">
                    <div class="image-item" id="image-${image._id}">
                      <a href="/images/photo/${image._id}">
                        <img
                          class="responsive-img"
                          src="data:image/${image.img.contentType};base64,${image.img.data}"
                          alt="${image.photo_name}"
                        />
                      </a>
                      <div class="image-details">
                        <h4>${image.photo_date_time}</h4>
                        <h5 id="image-index-display-name">${image.photo_name}</h5>
                        <p>Views: <span id="views-${image._id}">${image.views}</span></p>
                        <p>Likes: <span id="likes-${image._id}">${image.likes}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              `);
            });
          },
          error: function() {
            loader.remove();
            // Handle errors, e.g., display an error message
            alert(xhr.responseJSON?.message || 'An error occurred. Please try again.');
          }
      });
  });

  // Reset filter button
  $('#dateFilterResetButton').click(function() {
      $('#filterDateStart').val('');
      $('#filterDateEnd').val('');
      // Trigger the filter again to show all images
      $('#applyDateFilterButton').click();
  });
});