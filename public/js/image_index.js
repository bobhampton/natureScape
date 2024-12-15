

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

// WORKING
async function likeImage (id) {
  //console.log(`Attempting to like image with id: ${id}`); // Debugging
  
  // Check if user has already liked the image
  const likedImages = JSON.parse(localStorage.getItem('likedImages')) || {};
  if (likedImages[id]) {
    alert('You have already liked this image');
    return;
  }
  const response = await fetch(`/images/like/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (response.ok) {
    const data = await response.json()
    //console.log('Image liked successfully'); // Debugging

    // Update the number of likes in the DOM
    const likesElement = document.getElementById(`likes-${id}`)
    if (likesElement) {
      likesElement.textContent = data.likes
    }

    // Set a flag in local storage for when a user likes an image
    likedImages[id] = true;
    localStorage.setItem('likedImages', JSON.stringify(likedImages));

  } else {
    console.error('Error liking image:', response.statusText)
    alert('Error liking image')
  }
}
