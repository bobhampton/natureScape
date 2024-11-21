// Save the state of dark mode
function toggleDarkMode () {
  document.body.classList.toggle('dark-mode')
  const isDarkMode = document.body.classList.contains('dark-mode')
  localStorage.setItem('dark-mode', isDarkMode ? 'enabled' : 'disabled')
}

// Set the state of dark mode on page load so it's consistent
function darkModeSetting () {
  const darkMode = localStorage.getItem('dark-mode')
  if (darkMode === 'enabled') {
    document.body.classList.add('dark-mode')
    document.getElementById('darkModeSwitch').checked = true
  } else {
    document.body.classList.remove('dark-mode')
    document.getElementById('darkModeSwitch').checked = false
  }
}

document.addEventListener('DOMContentLoaded', darkModeSetting)

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

//TODO: Check if dark mode is enabled, and if so, refresh page with DM enabled
// Delete an image while viewing that image. Redirects back to the images list page
async function deleteImageSingleView (id) {
  console.log(`Attempting to delete image with id: ${id}`)
  const response = await fetch(`/images/${id}`, {
    method: 'DELETE'
  })
  if (response.ok) {
    console.log('Image deleted successfully')
    window.location.href = '/images' // Redirect to images list
  } else {
    console.error('Error deleting image:', response.statusText)
    alert('Error deleting image')
  }
}

/* function darkMode () {
    var element = document.body
    element.classList.toggle('dark-mode')
  } */
