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
