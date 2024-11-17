
// Client side check for image size before uploading
document.getElementById('uploadForm').addEventListener('submit', function(event) {
    const fileInput = document.getElementById('image');
    const maxUploadSize = 16 * 1024 * 1024; // 16MB

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.size > maxUploadSize) {
            alert('Photo size must be less than 16MB');
            event.preventDefault(); // Prevent form submission and keep any data entered
        }
    }
});

// Delete an image from the images list page
async function deleteImageFromList(id) {
    console.log(`Attempting to delete image with id: ${id}`);
    const response = await fetch(`/images/${id}`, {
        method: 'DELETE'
    });
    if (response.ok) {
        console.log('Image deleted successfully');
        location.reload(); // Refresh the page after deletion
    } else {
        console.error('Error deleting image:', response.statusText);
        alert('Error deleting image');
    }
}

// Delete an image while viewing that image. Redirects back to the images list page
async function deleteImageSingleView(id) {
    console.log(`Attempting to delete image with id: ${id}`);
    const response = await fetch(`/images/${id}`, {
        method: 'DELETE'
    });
    if (response.ok) {
        console.log('Image deleted successfully');
        window.location.href = '/images'; // Redirect to images list
    } else {
        console.error('Error deleting image:', response.statusText);
        alert('Error deleting image');
    }
}

function darkMode () {
    var element = document.body
    element.classList.toggle('dark-mode')
  }

  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}