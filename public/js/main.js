let darkmode = localStorage.getItem('darkmode');
const themeSwitch = document.getElementById('theme-switch');

const enableDarkmode = () => {
  document.body.classList.add('darkmode');
  localStorage.setItem('darkmode', 'active');
}

const disableDarkmode = () => {
  document.body.classList.remove('darkmode');
  localStorage.setItem('darkmode', null);
}

if (darkmode === 'active') enableDarkmode();

themeSwitch.addEventListener('click', () => {
  darkmode = localStorage.getItem('darkmode');
  darkmode !== 'active' ? enableDarkmode() : disableDarkmode();
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', () => {
      localStorage.removeItem('likedImages');
    });
  }
});