// // Save the state of dark mode
// function toggleDarkMode () {
//   document.body.classList.toggle('dark-mode')
//   const isDarkMode = document.body.classList.contains('dark-mode')
//   localStorage.setItem('dark-mode', isDarkMode ? 'enabled' : 'disabled')
// }

// // Set the state of dark mode on page load so it's consistent
// function darkModeSetting () {
//   const darkMode = localStorage.getItem('dark-mode')
//   if (darkMode === 'enabled') {
//     document.body.classList.add('dark-mode')
//     document.getElementById('darkModeSwitch').checked = true
//   } else {
//     document.body.classList.remove('dark-mode')
//     document.getElementById('darkModeSwitch').checked = false
//   }
// }

// document.addEventListener('DOMContentLoaded', darkModeSetting)

const body = document.querySelector('body'),
      nav = document.querySelector('nav'),
      modeToggle = document.querySelector('.dark-light'),
      searchToggle = document.querySelector('.searchToggle'),
      sidebarOpen = document.querySelector('.sidebarOpen'),
      sidebarClose = document.querySelector('.sidebarClose');

      let getMode = localStorage.getItem("mode");
          if(getMode && getMode === "dark-mode"){
            body.classList.add("dark");
          }

// code to toggle dark mode
      modeToggle.addEventListener('click', () =>{
        modeToggle.classList.toggle('active');
        body.classList.toggle('dark');

        // js code to keep user selected mode even page refresh or file reopen
        if(!body.classList.contains("dark")){
          localStorage.setItem("mode" , "light-mode");
        }else{
          localStorage.setItem("mode" , "dark-mode");
        }
      });

// code to toggle dark mode
      searchToggle.addEventListener('click', () =>{
        searchToggle.classList.toggle('active');
      });

// code to toggle sidebar
sidebarOpen.addEventListener('click', () => {
  nav.classList.add('active');
});

body.addEventListener('click', e => {
  let clickedElm = e.target;

  if(!clickedElm.classList.contains("sidebarOpen") && !clickedElm.classList.contains("menu")){
    nav.classList.remove("active");
  }
});