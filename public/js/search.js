// public/js/search.js
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("search-btn");
  const input = document.getElementById("search-input");
  const results = document.getElementById("ai-results");

  async function doSearch() {
    const q = input.value.trim();
    if (!q) return;
    results.innerHTML = "<p>Searching...</p>";
    try {
      const resp = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });
      const data = await resp.json();
      // render local + ai
      const local = (data.local || []).map(c => `<li>${c.title} — ${c.major}</li>`).join("");
      const ai = (data.ai || []).map(a => `<li><strong>${a.title}</strong> — ${a.reason} ${a.prereqs ? "(Prereq: "+a.prereqs+")":""}</li>`).join("");
      results.innerHTML = `<h3>Local matches</h3><ul>${local}</ul><h3>AI recommendations</h3><ul>${ai}</ul>`;
    } catch (e) {
      results.innerHTML = `<p>Error: ${e.message}</p>`;
    }
  }

  btn.addEventListener("click", doSearch);
  input.addEventListener("keydown", (ev) => { if (ev.key === "Enter") doSearch(); });
});
