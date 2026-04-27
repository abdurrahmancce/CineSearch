/* ==========================================================
   CineSearch — script.js
   ✅ Uses Wikipedia's FREE open API — NO API KEY NEEDED
   ✅ Works directly from any browser, no server required
   ✅ Returns real movie posters, plots, and descriptions
   ========================================================== */


/* ----------------------------------------------------------
   API ENDPOINTS
   Wikipedia has two free APIs we use together:
   1. Search API  → finds article titles matching the query
   2. Summary API → gets poster image + description per article
   ---------------------------------------------------------- */
const WIKI_SEARCH  = 'https://en.wikipedia.org/w/api.php';
const WIKI_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary';


/* ----------------------------------------------------------
   DOM ELEMENTS
   ---------------------------------------------------------- */
const searchForm  = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const clearBtn    = document.getElementById('clearBtn');
const heroState   = document.getElementById('heroState');
const loader      = document.getElementById('loader');
const errorState  = document.getElementById('errorState');
const errorMsg    = document.getElementById('errorMsg');
const resultsGrid = document.getElementById('resultsGrid');


/* ----------------------------------------------------------
   LAST SEARCHED QUERY — avoids duplicate requests
   ---------------------------------------------------------- */
let lastQuery = '';


/* ==========================================================
   EVENT LISTENERS
   ========================================================== */

/* Form submit — triggered by Enter key or clicking Search */
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;                              // ignore empty input
  if (query.toLowerCase() === lastQuery) return;  // ignore duplicate
  lastQuery = query.toLowerCase();
  searchMovies(query);
});

/* Show/hide the ✕ clear button as the user types */
searchInput.addEventListener('input', () => {
  clearBtn.hidden = searchInput.value.length === 0;
  if (searchInput.value.length === 0) lastQuery = ''; // reset so same query works again
});

/* Clear button click */
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.hidden   = true;
  lastQuery         = '';
  searchInput.focus();
});


/* ==========================================================
   MAIN SEARCH FUNCTION
   ========================================================== */

/**
 * searchMovies(query)
 * ─────────────────
 * Step 1: Search Wikipedia for articles related to the movie title
 * Step 2: For each result, fetch the full summary (poster + plot)
 * Step 3: Filter to only results that have a poster image
 * Step 4: Render the movie cards on screen
 */
async function searchMovies(query) {
  showLoader();

  try {
    /* ── STEP 1: Wikipedia article search ────────────────── */
    // We add "film" to the query to bias results toward movie articles.
    // The origin=* parameter enables CORS so the browser allows the request.
    const searchParams = new URLSearchParams({
      action:      'query',
      list:        'search',
      srsearch:    query + ' film',  // e.g. "Inception film"
      format:      'json',
      origin:      '*',              // REQUIRED for CORS — allows browser fetch
      srlimit:     12,               // get up to 12 article titles
      srnamespace: 0,                // namespace 0 = main articles only
    });

    const searchRes  = await fetch(`${WIKI_SEARCH}?${searchParams}`);
    const searchData = await searchRes.json();

    // Wikipedia returns an array under query.search
    const articles = searchData?.query?.search ?? [];

    if (articles.length === 0) {
      showError(`No results found for "${query}". Try a different title.`);
      return;
    }

    /* ── STEP 2: Fetch full summary for each article ─────── */
    // The summary endpoint returns: title, description, extract (plot),
    // thumbnail (poster image), and a link to the full Wikipedia page.
    //
    // We fetch all summaries at the same time using Promise.allSettled,
    // so even if one fails, the others still complete.
    const summaryPromises = articles.map((article) => {
      // Encode the title so spaces and special chars are URL-safe
      const encodedTitle = encodeURIComponent(article.title);
      return fetch(`${WIKI_SUMMARY}/${encodedTitle}`)
        .then((res) => res.json())
        .catch(() => null); // if one fetch fails, return null instead of crashing
    });

    const summaries = await Promise.all(summaryPromises);

    /* ── STEP 3: Filter to only real movie articles ───────── */
    // We keep only articles that:
    //  - Were fetched successfully (not null)
    //  - Have a thumbnail (poster image)
    //  - Have an extract (plot description)
    //  - Are "standard" type (not disambiguation or redirect pages)
    const movies = summaries.filter(
      (m) => m && m.type === 'standard' && m.thumbnail && m.extract
    );

    if (movies.length === 0) {
      // We found Wikipedia articles but none had poster images.
      // This happens for very obscure titles.
      showError(
        `Found articles but no movie posters for "${query}". Try a more popular title.`
      );
      return;
    }

    /* ── STEP 4: Render the cards ─────────────────────────── */
    renderMovies(movies);

  } catch (error) {
    // This catches network failures (no internet, DNS error, etc.)
    console.error('Search error:', error);
    showError('Network error. Please check your internet connection and try again.');
  }
}


/* ==========================================================
   RENDER FUNCTIONS
   ========================================================== */

/**
 * renderMovies(movies)
 * Clears old results and builds a card for each movie.
 */
function renderMovies(movies) {
  resultsGrid.innerHTML = ''; // clear previous results

  movies.forEach((movie, index) => {
    const card = buildMovieCard(movie, index);
    resultsGrid.appendChild(card);
  });

  showResults();
}


/**
 * buildMovieCard(movie, index)
 * ────────────────────────────
 * Maps Wikipedia summary fields to our card layout:
 *
 *  movie.title              → display title (cleaned up)
 *  movie.description        → short genre/type label
 *  movie.extract            → plot paragraph
 *  movie.thumbnail.source   → poster image URL
 *  movie.content_urls       → link to Wikipedia page
 */
function buildMovieCard(movie, index) {
  const card = document.createElement('article');
  card.className = 'movie-card';

  // Each card fades in 60ms later than the previous one (stagger effect)
  card.style.animationDelay = `${index * 60}ms`;

  /* ── Title ──────────────────────────────────────────────
     Wikipedia titles often look like: "The Dark Knight (film)"
     We strip the "(film)" / "(2008 film)" part for display.      */
  const rawTitle   = movie.title || 'Unknown Title';
  const cleanTitle = rawTitle.replace(/\s*\(.*?\)\s*/g, '').trim();

  /* ── Year ───────────────────────────────────────────────
     We look for a 4-digit year (19xx or 20xx) anywhere in
     the description string e.g. "2008 superhero film".           */
  const yearMatch = (movie.description || '').match(/\b(19|20)\d{2}\b/);
  const year      = yearMatch ? yearMatch[0] : '—';

  /* ── Genre / type label ─────────────────────────────────
     movie.description is short e.g. "2008 American superhero film"
     We trim it to avoid overflow on the badge.                    */
  const description = movie.description
    ? movie.description.replace(/^\d{4}\s+/, '').trim() // remove leading year
    : 'Film';
  const typeLabel = description.length > 30
    ? description.slice(0, 30) + '…'
    : description;

  /* ── Plot ───────────────────────────────────────────────
     movie.extract is the full Wikipedia intro paragraph.
     We cap it at 180 chars for the card preview.                  */
  const rawPlot = movie.extract || 'No description available.';
  const plot    = rawPlot.length > 180
    ? rawPlot.slice(0, 180).trim() + '…'
    : rawPlot;

  /* ── Poster ─────────────────────────────────────────────
     Wikipedia provides a thumbnail URL. We request a bigger
     version by replacing the pixel size in the URL.               */
  const thumbSrc   = movie.thumbnail?.source ?? '';
  // Upscale: replace e.g. /320px- with /500px- for better quality
  const posterSrc  = thumbSrc.replace(/\/\d+px-/, '/500px-');
  const posterHTML = posterSrc
    ? `<img
         src="${posterSrc}"
         alt="${safe(cleanTitle)} poster"
         loading="lazy"
         onerror="this.parentElement.innerHTML = window.noImageHTML()"
       />`
    : window.noImageHTML();

  /* ── Wikipedia page link ────────────────────────────────*/
  const wikiUrl = movie.content_urls?.desktop?.page ?? '#';

  /* ── Assemble the card HTML ─────────────────────────────*/
  card.innerHTML = `
    <div class="card-poster">
      ${posterHTML}
      <span class="card-year">${safe(year)}</span>
      <span class="card-type">${safe(typeLabel)}</span>
    </div>

    <div class="card-body">
      <h3 class="card-title">${safe(cleanTitle)}</h3>
      <p class="card-plot">${safe(plot)}</p>
      <a
        class="card-link"
        href="${wikiUrl}"
        target="_blank"
        rel="noopener"
        aria-label="Read more about ${safe(cleanTitle)} on Wikipedia"
      >
        Read on Wikipedia &rarr;
      </a>
    </div>
  `;

  return card;
}


/* ==========================================================
   UI STATE HELPERS
   Four possible states: hero → loading → results OR error
   ========================================================== */

function showLoader() {
  heroState.hidden   = true;
  errorState.hidden  = true;
  resultsGrid.hidden = true;
  loader.hidden      = false;
}

function showResults() {
  loader.hidden      = true;
  heroState.hidden   = true;
  errorState.hidden  = true;
  resultsGrid.hidden = false;
}

function showError(message) {
  loader.hidden        = true;
  resultsGrid.hidden   = true;
  heroState.hidden     = true;
  errorMsg.textContent = message;
  errorState.hidden    = false;
}


/* ==========================================================
   UTILITY HELPERS
   ========================================================== */

/**
 * safe(str)
 * Escapes HTML special characters to prevent XSS attacks.
 * Always use this before inserting API data into innerHTML.
 */
function safe(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * noImageHTML()
 * Returns fallback HTML shown when a poster image fails to load.
 * We expose this on window so the onerror attribute can call it.
 */
function noImageHTML() {
  return `
    <div class="poster-fallback">
      <span class="fi">🎬</span>
      <span>No Poster</span>
    </div>
  `;
}

// Expose on window so inline onerror handlers can access it
window.noImageHTML = noImageHTML;