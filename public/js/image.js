// Delete an image when viewing just that image
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

// Edit an image when viewing just that image
async function editImageSingleView (id) {
    console.log(`Attempting to edit image with id: ${id}`)
    window.location.href = `/images/edit/${id}` // Redirect to edit image page
  }
  

  