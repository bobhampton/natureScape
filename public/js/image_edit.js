// document.getElementById('cancel-button').addEventListener('click', function () {
//     history.back()
//   })

async function cancelEdit (id) {
  console.log(`Attempting to cancel edit of image with id: ${id}`)
  window.location.href = `/images/photo/${id}`
}