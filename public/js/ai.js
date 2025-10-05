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

    const code = document.createElement('strong');
    code.textContent = it.code || 'Class';

    const title = document.createElement('span');
    title.textContent = it.title ? ` — ${it.title}` : '';

    const reason = document.createElement('div');
    reason.style.fontSize = '.9em';
    reason.style.color = '#888';
    reason.textContent = it.reason || '';

    const prereqs = document.createElement('div');
    prereqs.style.fontSize = '.85em';
    prereqs.style.color = '#666';
    prereqs.textContent = it.prereqs ? `Prereqs: ${it.prereqs}` : '';

    li.appendChild(code);
    li.appendChild(title);
    li.appendChild(reason);
    if (it.prereqs) li.appendChild(prereqs);

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

    const code = document.createElement('strong');
    code.textContent = it.code || 'Major';

    const name = document.createElement('span');
    name.textContent = it.name ? ` — ${it.name}` : '';

    const reason = document.createElement('div');
    reason.style.fontSize = '.9em';
    reason.style.color = '#888';
    reason.textContent = it.reason || '';

    const prereqs = document.createElement('div');
    prereqs.style.fontSize = '.85em';
    prereqs.style.color = '#666';
    prereqs.textContent = it.prereqs ? `Prereqs: ${it.prereqs}` : '';

    li.appendChild(code);
    li.appendChild(name);
    li.appendChild(reason);
    if (it.prereqs) li.appendChild(prereqs);

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
