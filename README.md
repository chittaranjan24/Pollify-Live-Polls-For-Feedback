# Pollify - Live Polls for Feedback

![Pollify Landing Page](https://ik.imagekit.io/chittaranjanFSD/products/landingPage.jpg)

**Pitch Deck URL:** [https://csdev.hashnode.dev/building-pollify-engineering-a-real-time-polling-platform-that-handles-instant-feedback-at-scale](https://csdev.hashnode.dev/building-pollify-engineering-a-real-time-polling-platform-that-handles-instant-feedback-at-scale)


**Pollify** is a real-time polling application that allows users to create, share, and analyze polls to gather instant feedback. It's built with a modern tech stack, featuring a React frontend and a Node.js/Express backend, with real-time updates powered by Socket.io.

## Features

*   **User Authentication:** Secure user registration and login system using JWT (JSON Web Tokens).
*   **Poll Creation:** A dynamic and intuitive interface for creating polls with multiple questions and options.
*   **Customizable Polls:**
    *   Set polls as anonymous or require user authentication to respond.
    *   Set an expiration date for polls.
    *   Mark questions as mandatory.
*   **Real-time Analytics:** View poll results and analytics in real-time as responses come in.
*   **Shareable Polls:** Share polls with a unique, auto-generated link.
*   **Responsive Design:** A clean and modern UI that works on all screen sizes.

## Deployed Application

**Live URL:** [https://pollify-votekaro-six.vercel.app](https://pollify-votekaro-six.vercel.app)

## Tech Stack

### Frontend

*   **React:** A JavaScript library for building user interfaces.
*   **React Router:** For declarative routing in the React application.
*   **Axios:** A promise-based HTTP client for making requests to the backend.
*   **Socket.io Client:** For real-time communication with the server.
*   **CSS:** For styling the application, with a modern and clean design.

### Backend

*   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express:** A fast, unopinionated, minimalist web framework for Node.js.
*   **MongoDB:** A NoSQL database for storing application data.
*   **Mongoose:** An elegant MongoDB object modeling tool for Node.js.
*   **Socket.io:** For enabling real-time, bidirectional communication.
*   **JWT (JSON Web Tokens):** For secure user authentication.
*   **Bcrypt.js:** A library for hashing passwords.
*   **Dotenv:** A zero-dependency module that loads environment variables from a `.env` file.

## Application Flow

1.  **User Authentication:** Users can register for a new account or log in to an existing one. The backend authenticates the user and provides a JWT, which is stored on the client to authorize subsequent requests.

2.  **Poll Creation:** Authenticated users can create new polls from their dashboard. They can add multiple questions, each with several options, and configure settings like anonymity and expiration.

3.  **Responding to a Poll:** Polls can be shared via a unique link. Anyone with the link can respond, unless the poll requires authentication.

4.  **Real-time Analytics:** The poll creator can view a detailed analytics page for each poll. This page displays the number of responses for each option in real-time, thanks to Socket.io.

5.  **Publishing Results:** The creator can choose to publish the poll results. Once published, the poll is closed, and anyone with the link can view the final results.

## Use Cases

*   **Gathering Feedback:** Quickly collect feedback from a group of people on any topic.
*   **Market Research:** Conduct simple market research surveys.
*   **Educational Tool:** Engage students in the classroom with interactive quizzes and polls.
*   **Decision Making:** Help teams make decisions by quickly polling opinions.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm (or yarn)
*   MongoDB (local installation or a cloud service like MongoDB Atlas)

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username/Pollify-Live-Polls-For-Feedback.git
    ```

2.  **Install backend dependencies**
    ```sh
    cd server
    npm install
    ```

3.  **Install frontend dependencies**
    ```sh
    cd ../client
    npm install
    ```

4.  **Set up environment variables**
    Create a `.env` file in the `server` directory and add the following variables:
    ```
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLIENT_URL=http://localhost:3000
    ```

### Running the Application

1.  **Start the backend server**
    From the `server` directory:
    ```sh
    npm start
    ```

2.  **Start the frontend development server**
    From the `client` directory:
    ```sh
    npm start
    ```

The application will be available at `http://localhost:3000`.

## Project Structure

The project is organized into two main directories: `client` and `server`.

### `client`

*   `public/`: Contains the main `index.html` file.
*   `src/`: Contains the React application source code.
    *   `components/`: Reusable UI components (e.g., `Navbar`).
    *   `context/`: React context providers (e.g., `AuthContext`).
    *   `hooks/`: Custom React hooks (e.g., `useSocket`).
    *   `pages/`: The main pages of the application (e.g., `Home`, `Dashboard`, `CreatePoll`).

### `server`

*   `src/`: Contains the backend source code.
    *   `common/`: Common configurations and utilities.
        *   `config/`: Database and Socket.io configurations.
    *   `modules/`: The main modules of the application, each with its own routes, controllers, and models.
        *   `auth/`: User authentication module.
        *   `polls/`: Poll management module.
        *   `pollResponse/`: Poll response handling module.
*   `server.js`: The main entry point for the backend server.
