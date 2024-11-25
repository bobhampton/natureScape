// Client side check for image size before uploading
document
  .getElementById('uploadForm')
  .addEventListener('submit', function (event) {
    const fileInput = document.getElementById('image')
    const maxUploadSize = 16 * 1024 * 1024 // 16MB

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0]
      if (file.size > maxUploadSize) {
        console.log('File size is too big')
        event.preventDefault() // Prevent form submission and keep any data entered
        alert('Photo size must be less than 16MB')
        return
      }
    }
    console.log('Form submitted successfully')
  })
//TODO: Check if dark mode is enabled, and if so, refresh page with DM enabled
// Delete an image from the images list page
async function deleteImageFromList (id) {
    console.log(`Attempting to delete image with id: ${id}`)
    const response = await fetch(`/images/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      console.log('Image deleted successfully')
      location.reload() // Refresh the page after deletion
    } else {
      console.error('Error deleting image:', response.statusText)
      alert('Error deleting image')
    }
  }