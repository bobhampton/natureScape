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

async function deleteImageFromList (id) {
  console.log(`Attempting to delete image with id: ${id}`)
  const response = await fetch(`/images/${id}`, {
    method: 'DELETE'
  })
  if (response.ok) {
    console.log('Image deleted successfully')
    //location.reload() // Refresh the page after deletion
    const image = document.getElementById(`image-${id}`)
    if (image) {
      image.remove()
    }
  } else {
    console.error('Error deleting image:', response.statusText)
    alert('Error deleting image')
  }
}

// Function to like an image
async function likeImage (id) {
  //console.log(`Attempting to like image with id: ${id}`); // Debugging
  const response = await fetch(`/images/like/${id}`, {
    method: 'POST'
  })
  if (response.ok) {
    const data = await response.json()
    //console.log('Image liked successfully'); // Debugging

    // Update the number of likes in the DOM
    const likesElement = document.getElementById(`likes-${id}`)
    if (likesElement) {
      likesElement.textContent = data.likes
    }
  } else {
    console.error('Error liking image:', response.statusText)
    alert('Error liking image')
  }
}
