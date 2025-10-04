(function(){
  // --- classes ---
  const cIn  = document.getElementById('ai-class-input');
  const cBtn = document.getElementById('ai-class-btn');
  const cOut = document.getElementById('ai-class-results');

  function renderClassAI(items){
    cOut.innerHTML = '';
    if (!Array.isArray(items) || !items.length) {
      cOut.innerHTML = '<li>No AI class recommendations.</li>';
      return;
    }
    for (const it of items) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      const href = it?.linkPath || ('/class/' + encodeURIComponent(it?.code || 'unknown'));
      a.href = href;
      a.textContent = it?.code || it?.title || 'Class';
      const titleText = document.createTextNode(' — ' + (it?.title || ''));
      const reason = document.createElement('div');
      reason.className = 'muted';
      reason.textContent = it?.reason || '';
      li.appendChild(a);
      li.appendChild(titleText);
      li.appendChild(reason);
      cOut.appendChild(li);
    }
  }

  async function fetchClassAI() {
    const query = cIn.value.trim();
    if (!query) return;
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      renderClassAI(data?.ai || []);
    } catch (e) {
      console.error(e);
      cOut.innerHTML = '<li>AI class search failed.</li>';
    }
  }

  cBtn.addEventListener('click', fetchClassAI);
  cIn.addEventListener('keydown', e => { if (e.key === 'Enter') fetchClassAI(); });

  // --- majors ---
  const mIn  = document.getElementById('ai-major-input');
  const mBtn = document.getElementById('ai-major-btn');
  const mOut = document.getElementById('ai-major-results');

  function renderMajorAI(items){
    mOut.innerHTML = '';
    if (!Array.isArray(items) || !items.length) {
      mOut.innerHTML = '<li>No AI major suggestions.</li>';
      return;
    }
    for (const it of items) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      const href = it?.linkPath || ('/majors/' + encodeURIComponent(it?.code || 'unknown'));
      a.href = href;
      a.textContent = it?.code || it?.name || 'Major';
      const nameText = document.createTextNode(' — ' + (it?.name || ''));
      const reason = document.createElement('div');
      reason.className = 'muted';
      reason.textContent = it?.reason || '';
      const prereqs = document.createElement('div');
      prereqs.className = 'muted smaller';
      if (it?.prereqs) prereqs.textContent = `Prereqs: ${it.prereqs}`;
      li.appendChild(a); li.appendChild(nameText); li.appendChild(reason); li.appendChild(prereqs);
      mOut.appendChild(li);
    }
  }

  async function fetchMajorAI() {
    const interests = mIn.value.trim();
    if (!interests) return;
    try {
      const res = await fetch('/api/ai/majors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests })
      });
      const data = await res.json();
      renderMajorAI(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      mOut.innerHTML = '<li>AI major search failed.</li>';
    }
  }

  mBtn.addEventListener('click', fetchMajorAI);
  mIn.addEventListener('keydown', e => { if (e.key === 'Enter') fetchMajorAI(); });
})();

async function fetchClassAI() {
  const query = cIn.value.trim();
  if (!query) {
    cOut.innerHTML = '<li>Please type your interests first.</li>';
    return;
  }
  // ... existing fetch ...
}

async function fetchMajorAI() {
  const interests = mIn.value.trim();
  if (!interests) {
    mOut.innerHTML = '<li>Please type your interests first.</li>';
    return;
  }
  // ... existing fetch ...
}
