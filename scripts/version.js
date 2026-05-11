// version.js — fetches latest main commit info and renders it in the footer.
// Owns: initVersionFooter.
// Depends on: data.js (escapeHtml). Uses GitHub's public REST API (no auth).
// Rate limit: 60 req/hour per IP unauthenticated — plenty for a personal site.

const VERSION_REPO = 'dhruvinrsoni/dhruvinrsoni.github.io';

async function initVersionFooter() {
  const el = document.getElementById('footer-version');
  if (!el) return;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${VERSION_REPO}/commits/main`,
      { headers: { 'Accept': 'application/vnd.github+json' } }
    );
    if (!res.ok) throw new Error('GitHub API ' + res.status);
    const data = await res.json();

    const sha = data.sha;
    const short = sha.slice(0, 7);
    const commitDate = new Date(data.commit.author.date);
    // toLocaleString picks up the browser's local timezone automatically.
    const local = commitDate.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    const message = (data.commit.message || '').split('\n')[0];
    const commitUrl = `https://github.com/${VERSION_REPO}/commit/${sha}`;

    el.innerHTML =
      'Latest: ' +
      `<a href="${commitUrl}" target="_blank" rel="noopener" ` +
      `title="${escapeHtml(message)}"><code>${escapeHtml(short)}</code></a>` +
      ` · <span title="commit timestamp · ${escapeHtml(commitDate.toISOString())} ` +
      `(Pages typically deploys 1-2 min after)">${escapeHtml(local)}</span>`;
  } catch (e) {
    el.textContent = '(version info unavailable)';
  }
}
