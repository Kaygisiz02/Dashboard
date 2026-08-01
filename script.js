const API_BASE = 'https://v2.jokeapi.dev/joke';
const newJokeBtn = document.getElementById('newJoke');
const categorySelect = document.getElementById('category');
const jokeText = document.getElementById('jokeText');
const jokeExtra = document.getElementById('jokeExtra');
const copyBtn = document.getElementById('copyBtn');
const tweetLink = document.getElementById('tweetLink');

async function fetchJoke(category = 'Any') {
  const safe = 'blacklistFlags=nsfw,religious,political,racist,sexist,explicit';
  const url = `${API_BASE}/${encodeURIComponent(category)}?${safe}&amount=1`;
  try {
    setLoading(true);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    // data can be either a single joke object or a list; handle commonly returned object
    // For single item, data.type === 'single' | 'twopart'
    return data;
  } finally {
    setLoading(false);
  }
}

function formatJoke(data) {
  if (!data) return { text: 'No joke found', extra: '' };
  // If the API returns a "joke" (single) or setup+delivery (twopart)
  if (data.type === 'single') {
    return { text: data.joke, extra: '' };
  } else if (data.type === 'twopart') {
    return { text: data.setup, extra: data.delivery };
  } else if (Array.isArray(data.jokes) && data.jokes.length) {
    // sometimes API returns a .jokes array
    return formatJoke(data.jokes[0]);
  } else {
    return { text: 'Unexpected response format', extra: '' };
  }
}

function setLoading(isLoading) {
  newJokeBtn.textContent = isLoading ? 'Loading…' : 'Get a joke';
  newJokeBtn.disabled = isLoading;
}

async function showJoke() {
  try {
    const cat = categorySelect.value || 'Any';
    const data = await fetchJoke(cat);
    const { text, extra } = formatJoke(data);
    jokeText.textContent = text;
    jokeExtra.textContent = extra ? extra : '';
    jokeExtra.setAttribute('aria-hidden', extra ? 'false' : 'true');
    copyBtn.disabled = false;
    tweetLink.classList.remove('disabled');
    tweetLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + (extra ? ' — ' + extra : ''))}`;
  } catch (err) {
    jokeText.textContent = 'Could not load a joke. Try again.';
    jokeExtra.textContent = '';
    copyBtn.disabled = true;
    tweetLink.classList.add('disabled');
    console.error(err);
  }
}

newJokeBtn.addEventListener('click', showJoke);

copyBtn.addEventListener('click', async () => {
  const text = jokeText.textContent + (jokeExtra.textContent ? '\n' + jokeExtra.textContent : '');
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
  } catch {
    copyBtn.textContent = 'Copy failed';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
  }
});

// Load one on page open
document.addEventListener('DOMContentLoaded', () => {
  showJoke();
});
