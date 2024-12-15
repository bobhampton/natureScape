const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('submit', (e) => {
  if (confirm("Are you sure you want to log out?")) {
    window.location.href = "/logout";
  }
});