
// Client side check for image size before uploading
function checkFileSize(event) {    
    const fileInput = document.getElementById('image');
    const maxUploadSize = 16 * 1024 * 1024; // 16MB

    if (fileInput.files.length === 0) {
        event.preventDefault(); // Prevent form submission and keep any data entered
        alert('1Please select a photo to upload');
    }
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.size > maxUploadSize) {
            event.preventDefault(); // Prevent form submission and keep any data entered
            alert('2Photo size must be less than 16MB');
            //return false
        }
    }
    //return true
};

document.getElementById('uploadForm').addEventListener('submit', checkFileSize); {
//TODO: Check if dark mode is enabled, and if so, refresh page with DM enabled
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

//TODO: Check if dark mode is enabled, and if so, refresh page with DM enabled
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