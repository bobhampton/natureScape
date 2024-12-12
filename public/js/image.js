

// Delete an image when viewing just that image
async function deleteImageSingleView (id) {
  console.log(`Attempting to delete image with id: ${id}`)
  const response = await fetch(`/images/${id}`, {
    method: 'DELETE'
  })
  if (response.ok) {
    console.log('Image deleted successfully')
    //window.location.href = '/images' // Redirect to images list
    window.location.href = document.referrer // document.referrer contains url of prev page
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

// Listener for back button on single image and edit image page
document.getElementById('back-button').addEventListener('click', function () {
  window.location.href = '/images'
})

// Listener for add comment form
document.getElementById('add-comment-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const commentText = document.getElementById('comment_text').value;
  let =
  const photoId = '{{photo._id}}';

  const response = await fetch(`/images/comment/${photoId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ comment_text: commentText })
  });

  if (response.ok) {
    const newComment = await response.json();
    const commentList = document.querySelector('.photo-comments ul');
    const newCommentElement = document.createElement('li');
    newCommentElement.innerHTML = `
      <p class="comment-text">${newComment.comment_text}</p>
      <p class="comment-meta">USERNAME: ${newComment.username} | On: ${newComment.creation_time}</p>
    `;
    commentList.appendChild(newCommentElement);
    document.getElementById('comment_text').value = '';
  } else {
    alert('Error adding comment');
  }
});