const API_BASE = 'https://v2.jokeapi.dev/joke';
const newJokeBtn = document.getElementById('newJoke');
const categorySelect = document.getElementById('category');
const jokeText = document.getElementById('jokeText');
const jokeExtra = document.getElementById('jokeExtra');
const copyBtn = document.getElementById('copyBtn');
const tweetLink = document.getElementById('tweetLink');

// Denylist: simple word-based filter (expand as needed)
const DENYLIST = [
  /sledgehammer/i, /kill/i, /murder/i, /rape/i, /shoot/i, /slaughter/i,
  /bleed/i, /blood/i, /decap/i, /suicid/i, /strangl/i, /beat to death/i
];

function isUnsafe(text){
  if(!text) return false;
  return DENYLIST.some(re => re.test(text));
}

function secureRandomIndex(max){
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return arr[0] % max;
}

async function fetchJokesBatch(category='Any', amount=10){
  const safeFlags = 'blacklistFlags=nsfw,religious,political,racist,sexist,explicit';
  const url = `${API_BASE}/${encodeURIComponent(category)}?${safeFlags}&amount=${amount}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('JokeAPI failed: ' + res.status);
  return res.json();
}

async function fetchIcanhaz(){
  const res = await fetch('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' } });
  if(!res.ok) throw new Error('icanhazdadjoke failed: ' + res.status);
  return res.json(); // {id, joke}
}

function normalizeToArray(payload){
  if(!payload) return [];
  if(Array.isArray(payload.jokes)) return payload.jokes;
  if(payload.type) return [payload];
  return [];
}

function formatJoke(data){
  if(!data) return {text:'', extra:''};
  if(data.type === 'single') return {text: data.joke || '', extra: ''};
  if(data.type === 'twopart') return {text: data.setup || '', extra: data.delivery || ''};
  if(data.joke) return {text: data.joke, extra: ''}; // icanhaz fallback
  return {text:'', extra:''};
}

function setLoading(isLoading){
  newJokeBtn.textContent = isLoading ? 'Loading…' : 'Get a joke';
  newJokeBtn.disabled = isLoading;
}

async function showJoke(){
  setLoading(true);
  try{
    const cat = categorySelect.value || 'Any';
    let payload;
    try{
      payload = await fetchJokesBatch(cat, 10);
    }catch(e){
      console.warn('Primary API failed:', e);
      payload = null;
    }

    let list = normalizeToArray(payload);
    // apply filter
    const safeList = list.filter(item => {
      const { text, extra } = formatJoke(item);
      const combined = (text + ' ' + (extra || '')).trim();
      return combined && !isUnsafe(combined);
    });

    let chosen;
    if(safeList.length > 0){
      chosen = safeList[secureRandomIndex(safeList.length)];
      const { text, extra } = formatJoke(chosen);
      jokeText.textContent = text;
      jokeExtra.textContent = extra || '';
      copyBtn.disabled = false;
      tweetLink.classList.remove('disabled');
      tweetLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + (extra ? ' — ' + extra : ''))}`;
      setLoading(false);
      return;
    }

    // fallback to icanhazdadjoke
    try{
      const fallback = await fetchIcanhaz();
      const { joke } = fallback;
      jokeText.textContent = joke || 'No joke available.';
      jokeExtra.textContent = '';
      copyBtn.disabled = false;
      tweetLink.classList.remove('disabled');
      tweetLink.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(joke || '')}`;
    }catch(err){
      console.error('Fallback also failed', err);
      jokeText.textContent = 'Could not load a joke. Try again.';
      jokeExtra.textContent = '';
      copyBtn.disabled = true;
      tweetLink.classList.add('disabled');
    }

  }catch(err){
    console.error(err);
    jokeText.textContent = 'Could not load a joke. Try again.';
    jokeExtra.textContent = '';
    copyBtn.disabled = true;
    tweetLink.classList.add('disabled');
  }finally{
    setLoading(false);
  }
}

newJokeBtn.addEventListener('click', showJoke);

copyBtn.addEventListener('click', async () => {
  const text = jokeText.textContent + (jokeExtra.textContent ? '\n' + jokeExtra.textContent : '');
  try{
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(()=> (copyBtn.textContent = 'Copy'), 1200);
  }catch{
    copyBtn.textContent = 'Copy failed';
    setTimeout(()=> (copyBtn.textContent = 'Copy'), 1200);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  showJoke();
});
