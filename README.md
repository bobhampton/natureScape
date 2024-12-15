# NatureScape

**Note: A Mapbox API key is required for this project to work correctly.**

NatureScape is a web application designed to provide users with a platform to share and explore nature photography. Users can create profiles, upload images, provide feedback, and interact with other users' content.

## Description

NatureScape allows users to create an account, upload their nature photographs, and share them with the community. Users can also view, like, and comment on other users' photos. The application includes features such as dark mode, user feedback, and profile management.

## Features

- User authentication and profile management
- Image upload and display
- Feedback system for user interactions
- Dark mode toggle
- Responsive design for various devices

## Getting Started

### Dependencies

- Node.js
- npm (Node Package Manager)
- MongoDB
- Git

**Note: Please use images from the `test_images` folder when uploading photos.**

### Installing

#### Install Git

##### For Mac Users

1. **Install Homebrew** (if not already installed):

    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

2. **Install Git**:

    ```bash
    brew install git
    ```

##### For Windows Users

1. **Download Git**:

    Download Git from [git-scm.com](https://git-scm.com/download/win).

2. **Install Git**:

    Run the downloaded installer and follow the on-screen instructions.

#### Clone the Repository

```bash
git clone https://github.com/BobbyBoy101/NatureScape.git
cd NatureScape
```

#### Install Dependencies

##### For Mac Users

1. **Install Homebrew** (if not already installed):

    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

2. **Install Node.js and npm**:

    ```bash
    brew install node
    ```

3. **Install MongoDB**:

    ```bash
    brew tap mongodb/brew
    brew install mongodb-community@5.0
    ```

##### For Windows Users

1. **Install Node.js and npm**:

    Download and install Node.js from [nodejs.org](https://nodejs.org/).

2. **Install MongoDB**:

    Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community).

#### Set Up Environment Variables

Create a `.env` file in the root directory and add the following environment variable:

```env
MAPBOX_API_KEY=<your_mapbox_api_key>
```

**Note**: Replace `<your_mapbox_api_key>` with your actual Mapbox API key. The project will not work without a valid Mapbox API key.

#### Run the Application

1. **Install the dependencies**:

    ```bash
    npm install
    ```

2. **Seed the database**:

    ```bash
    npm run seed
    ```

3. **Start the server**:

    ```bash
    npm start
    ```

The application will be available at `http://localhost:3000`.

### Usage

1. **Create an Account**: Navigate to the sign-up page and create a new account.
2. **Upload Images**: Once logged in, you can upload your nature photographs.
3. **View and Interact**: Browse through the images uploaded by other users, like, and comment on them.
4. **Dark Mode**: Toggle dark mode using the switch in the navigation bar.
5. **Provide Feedback**: Submit feedback for other users' profiles.

## Project Structure

- `app.js`: Main application file that sets up the server and middleware.
- `routes/`: Contains route handlers for different parts of the application.
- `public/`: Static files such as CSS, JavaScript, and images.
- `views/`: Handlebars templates for rendering HTML pages.
- `data/`: Contains data access functions for interacting with the database.
- `config/`: Configuration files for the application.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact
For any questions or suggestions, please contact the project maintainers at [natureScape@example.com](mailto:natureScape@gmail.com).

## GitHub Link
- https://github.com/BobbyBoy101/NatureScape