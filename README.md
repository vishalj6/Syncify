# Syncify

## Description

Syncify is a full-stack web application that allows users to convert a YouTube playlist into a Spotify playlist. The project includes both a frontend and a backend, with the frontend handling user interactions and Spotify authentication, while the backend manages API interactions with YouTube and Spotify.

## Features

- Convert YouTube playlists to Spotify playlists
- Authentication with Spotify
- Search for tracks on Spotify
- Responsive user interface

## Images

1. ![Home Page](https://via.placeholder.com/600x400?text=Frontend+Screenshot)
2. ![YouTube Playlist](https://via.placeholder.com/600x400?text=Backend+Screenshot)
3. ![Converted Page](https://via.placeholder.com/600x400?text=Playlist+Conversion)
4. ![Spotify Playlist](https://via.placeholder.com/600x400?text=Spotify+Playlist+Link)

## Project Structure

- **`client/`**: Frontend application built with React and TypeScript
- **`server/`**: Backend application built with Node.js and Express

## Frontend

### Setup

1. **Navigate to the client directory:**

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

### Configuration

- Configure environment variables in `.env` file.

### Environment Variables

Create a `.env` file in the `client` directory with the following variables:

```env
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

## Backend

### Setup

1. **Navigate to the server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the server:**

   ```bash
   npm run start
   ```

### Configuration

- Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:5000/callback
YOUTUBE_API_KEY=your_youtube_api_key
SPOTIFY_USER_ID=your_spotify_user_id
FRONTEND_URI=http://localhost:5173
```

## Usage

1. **Open the frontend application in your browser at [http://localhost:3000](http://localhost:3000).**

2. **Authenticate with Spotify.**

3. **Enter the YouTube playlist URL to convert it into a Spotify playlist.**

4. **View and manage your Spotify playlist.**

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them.
4. Push to your branch.
5. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or suggestions, please reach out at [jadejavishal6@gmail.com](mailto:jadejavishal6@gmail.com).

---

_This README was generated with ❤️ by [Vishal Jadeja](https://github.com/vishalj6)._
