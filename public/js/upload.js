// Client side check for image size before uploading
document
  .getElementById('uploadForm')
  .addEventListener('submit', function (event) {
    const fileInput = document.getElementById('image')
    const maxUploadSize = 16 * 1024 * 1024 // 16MB

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0]
      if (file.size > maxUploadSize) {
        console.log('File size must be less than 16MB')
        event.preventDefault() // Prevent form submission and keep any data entered
        alert('Photo size must be less than 16MB')
        return
      }
    }
    console.log('Form submitted successfully')
  })