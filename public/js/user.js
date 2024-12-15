// const termsContent = document.getElementById('terms-content');
// const showTermsLink = document.getElementById('show-terms-link');

// showTermsLink.addEventListener('click', function(event) {
//   event.preventDefault();
//   termsContent.classList.toggle('hidden');
// });

document.addEventListener('DOMContentLoaded', function() {
  const termsContent = document.getElementById('terms-content');
  const showTermsLink = document.getElementById('show-terms-link');

  showTermsLink.addEventListener('click', function(event) {
    event.preventDefault();
    termsContent.classList.toggle('hidden');
  });
});
