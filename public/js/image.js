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