$(document).ready(function() {
  $('#applyDateFilterButton').click(function(event) {
      event.preventDefault();

      // Get the selected dates
      const startDate = document.getElementById("filterDateStart").value;
      const endDate = document.getElementById("filterDateEnd").value;

      if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
      }
      if (startDate === endDate) {
        alert('Please select start and end dates that are not the same.');
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        alert('Start date cannot be after end date.');
        return;
      }

      const url = window.location.pathname;
      const locationId = url.match(/\/([a-f0-9]{24})$/)[1];
      
      const timeline = $('#timeline');
      timeline.empty();

      const loader = $('<p>Loading...</p>');
      timeline.append(loader);

      // Send an AJAX request to the server
      $.ajax({
          url: `/locationlist/${locationId}/filterImages`, // Updated endpoint
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
              startDate: startDate,
              endDate: endDate
          }),
          success: function(response) {
              loader.remove();
              if (response.images.length === 0) {
                  timeline.append("<p>No images found for the selected date range.</p>");
                  return;
              }
              // Process the response and update the timeline
              response.images.forEach(image => {
                  const imageElement = `
                      <div class="timeline-container" id="timeline-container-${image._id}">
                          <div class="timeline-text-box">

                              <h5>Photo Name: ${image.photo_name}</h5>
                              <h4 id="photoDate-Info-${image._id}">Date/Title Uploaded: ${image.photo_date_time}</h4>
                              <p>Photo Description: ${image.photo_description}</p>
                              <a href="/images/photo/${image._id}">View photo page</a>
                              <img src="data:image/${image.img.contentType};base64,${image.img.data}" alt="${image.photo_name}" class="responsive-img">

                          </div>
                      </div>`;
                  timeline.append(imageElement);
              });
          },
          error: function() {
              loader.remove();
              timeline.append("<p>Error loading data.</p>");
          }
      });
  });
  $('#dateFilterResetButton').click(function() {
    location.reload();
  });
});