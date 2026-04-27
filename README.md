# 🎬 CineSearch — Movie Search App

CineSearch is a modern and responsive movie search application built using **HTML, CSS, and JavaScript**. It allows users to search for movies, explore details, and enjoy a clean cinematic UI experience.It is a beautifully designed, responsive movie search web app that lets users discover films instantly using the power of Wikipedia’s open API — no API key required.

![CineSearch Preview](https://img.shields.io/badge/UI-Cinematic_Dark-e8b84b?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![API](https://img.shields.io/badge/Data-Wikipedia_API-white?style=for-the-badge)

---

## 🚀 Live Demo
🔗 [https://your-live-link-here.com](https://abdurrahmancce.github.io/CineSearch/)

---

## 📌 Features

- 🔍 Search movies by title
- 🎥 Display movie posters, titles, and details
- ⚡ Fast and dynamic API-based results
- 🎨 Clean cinematic UI with dark theme
- 📱 Fully responsive design (Mobile + Desktop)
- 🧠 User-friendly interface

---

## 🛠️ Tech Stack

- **HTML5** – Structure
- **CSS3** – Styling & layout
- **JavaScript (Vanilla JS)** – Functionality
- **Movie API** – Fetch movie data (e.g., OMDb API)

---

## 🔑 API Setup

This project uses a movie API (like OMDb API).

1. Get your free API key from:
👉 https://www.omdbapi.com/
2. Open script.js
3. Replace the API key :  **const API_KEY = "your_api_key_here";**

---

## 📖 How It Works

CineSearch utilizes a two-step data fetching pipeline:

1.  **The Search Phase:** Queries the Wikipedia `w/api.php` endpoint with a "film" keyword bias to find relevant article titles.
2.  **The Enrichment Phase:** Uses `Promise.allSettled` to concurrently fetch detailed summaries from the `api/rest_v1/page/summary` endpoint for every title found.
3.  **The Render Phase:** Filters the results to ensure they contain a valid "thumbnail" and "extract" before injecting them into the DOM with staggered fade-in animations.

---

## 🎨 UI Highlights

-   **Film Grain Overlay:** A subtle SVG-based noise filter provides a nostalgic, cinematic texture to the background.
-   **Staggered Animations:** Results appear with a 60ms delay increment, creating a professional "flow" effect.
-   **Interactive States:** Includes a "Hero" landing state, a custom-designed animated "Film Reel" loader, and graceful error handling for empty results.

---

## 📸 Screenshots

---

## 🏠 Home Page

<img width="930" height="775" alt="image" src="https://github.com/user-attachments/assets/ed501ba1-2020-409e-9258-dd7c6b47fb07" />

---

## 🔍 Search Results

<img width="1920" height="2583" alt="image" src="https://github.com/user-attachments/assets/453da9ce-2d4e-4b69-a728-e8bbe3a282da" />

---

## 🎯 Future Improvements

- ⭐ Add favorite/watchlist feature
- 🎬 Movie trailer integration
- 🔎 Advanced filters (year, genre, rating)
- 🌙 Light/Dark mode toggle

---

## 🧑‍💻 Author

**Abdur Rahman**

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.s project is licensed under the MIT License.

---

## 🌟 Support

If you like this project, consider giving it a ⭐ on GitHub!

---

**Built with ❤️ for film lovers.**
