$(document).ready(function() {
  $('#applyDateFilterButton').click(function(event) {
      event.preventDefault();

      // Get the selected dates
      let startDate = $('#filterDateStart').val();
      let endDate = $('#filterDateEnd').val();

      // Send an AJAX request to the server
      $.ajax({
          url: window.location.pathname, // Replace with your actual endpoint
          type: 'POST',
          data: {
              startDate: startDate,
              endDate: endDate
          },
          success: function(response) {
              // Update the timeline with the filtered images
              $('#timeline').html(response);
          },
          error: function() {
              // Handle errors, e.g., display an error message
              alert('An error occurred. Please try again.');
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