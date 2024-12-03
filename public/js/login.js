const loginForm = document.getElementById('login_form');
const username = document.getElementById('uname');
const password = document.getElementById('passwd');

loginForm.addEventListener('submit', async (e) => {
  let errors = [];
  //Check username for errors
  errors = await checkLoginInfo(username.value, password.value);

  if (errors.length > 0) {
      e.preventDefault();
      error_message.innerText = errors.join(". ");
  }
});

const checkLoginInfo = async (usernameInput, passwordInput) => {
    let errors = [];
    //Check that inputs are provided
    if (usernameInput === null || usernameInput === undefined || typeof usernameInput !== 'string' || usernameInput.trim() === "") {
      errors.push("Please enter a valid username");
    }
    //Authenticate user if inputs provided
    // let user = await checkUser(usernameInput)
    // if (!user) {
    //   errors.push(`User ${usernameInput} does not exist`);
    // } 
    // else if (!(await checkPassword(usernameInput, passwordInput))) {
    //   errors.push("Incorrect username or password");
    // }
    const userResponse = await fetch("/login/checkUser", {
      method:'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username: usernameInput}),
    });
    const userResult = await userResponse.json();
    if (!userResult.exists) {
      errors.push("Incorrect username or password");
    }
    else {
      const passwordResponse = await fetch("/login/checkPassword", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ username: usernameInput, password: passwordInput}),
      });
      const passwordResult = await passwordResponse.json();
      if (!passwordResult.valid) {
        errors.push("Incorrect username or password");
      }
    }

    return errors;
};