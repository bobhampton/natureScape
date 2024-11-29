import { checkUser, checkPassword } from "../../data/login";

const form = document.getElementById('login_form');
const username = document.getElementsByName('uname');
const password = document.getElementsByName('passwd');

form.addEventListener('submit', (e) => {
    let errors = [];
    //Check username for errors
    errors = checkLoginInfo(username.value, password.value);

    if (errors.length > 0) {
        e.preventDefault();
        error_message.innerText = errors.join(". ");
    }
});

function checkLoginInfo (usernameInput, passwordInput) {
    let errors = [];
    //Check that inputs are provided
    if (usernameInput === null || usernameInput === undefined || usernameInput.trim() === "") {
        errors.push("Please enter a valid username");
    }
    //Authenticate user if inputs provided
    let user = checkUser(usernameInput)
    if (!user) {
        errors.push(`User ${usernameInput} does not exist`);
    } 
    else if (!checkPassword(usernameInput, passwordInput)) {
        errors.push("Incorrect username or password");
    }

    return errors;
};