/* ==========================================================================
   Terminal interactif — fabrice@lome:~$
   Le contenu vient de src/data/ (via #site-data) : il suit l'admin automatiquement.
   ========================================================================== */

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const row = (k, v) => `<div class="t-row"><span class="t-acc">${k}</span><span>${v}</span></div>`;
const link = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label ?? url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>`;
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function initTerminal({ root, data, onHire, onTogo, onSignal }) {
  const T = data.terminal;
  const out = root.querySelector('#termOut');
  const input = root.querySelector('#termInput');
  const body = root.querySelector('#termBody');
  const history = [];
  let hIdx = 0;
  let busy = false;

  const print = (html, cls = '') => {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.innerHTML = html;
    out.appendChild(div);
    body.scrollTop = body.scrollHeight;
  };
  const echo = (cmd) => print(`<span class="t-p">fabrice@lome:~$</span> <span class="t-cmd">${esc(cmd)}</span>`);

  const commands = {
    help: () => [
      `<span class="t-mut">${T.available}</span>`,
      ...Object.entries(T.cmds).map(([k, v]) => row(k === 'hire' ? 'sudo hire-me' : k, v)),
      `<span class="t-mut">${T.tip}</span>`,
    ].join(''),
    whoami: () => [
      `<span class="t-acc">${esc(data.author)}</span>`,
      `${esc(data.specialty)} — Lomé, Togo <span class="flag"></span>`,
      esc(data.headline),
    ].join('<br>'),
    projects: () => data.projects.map((p) => row(slug(p.name), `${esc(p.summary.split(/[.:]/)[0])}${p.url ? `<br>${link(p.url)}` : ''}`)).join(''),
    ls: () => '<span class="t-acc">projets/</span>  <span class="t-acc">clients/</span>  cv.pdf  services.md  <span class="t-mut">.secret</span>',
    skills: () => data.skills.map((c) => row(slug(c.category), esc(c.items.join(' · ')))).join(''),
    experience: () =>
      data.experience.map((j) => row(esc(j.period), `${esc(j.company)} — ${esc(j.position)}`)).join('') +
      data.education.map((e) => row(T.education, `${esc(e.degree)} · ${esc(e.school)}`)).join(''),
    services: () => data.services.map((s) => row(slug(s.title), esc(s.price))).join(''),
    contact: () => [
      row(T.email, link(`mailto:${data.email}`, data.email)),
      row('whatsapp', link(`https://wa.me/${data.whatsapp}`, data.phone)),
      row(T.response, esc(data.responseTime)),
    ].join(''),
    socials: () => data.socials.map((s) => row(slug(s.text), link(s.href))).join(''),
    date: () => new Intl.DateTimeFormat(data.locale === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'full', timeStyle: 'medium', timeZone: 'Africa/Lome' }).format(new Date()) + ' <span class="t-mut">(Lomé, GMT)</span>',
    pwd: () => '/home/fabrice/lome/togo',
    'cat .secret': () => T.secret,
    togo: () => { onTogo?.(); return `<span class="flag"></span> ${T.togo}`; },
    signal: () => { onSignal?.(); return T.signal; },
    'rm -rf /': () => T.rmrf,
    exit: () => T.exit,
    sudo: () => '<span class="t-err">usage :</span> sudo hire-me',
    coffee: () => T.coffee,
    clear: () => { out.innerHTML = ''; return null; },
  };
  const aliases = { cv: 'experience', stack: 'skills', projets: 'projects', aide: 'help', 'ls projets': 'projects' };
  const names = [...Object.keys(commands), 'sudo hire-me'];

  async function hire() {
    busy = true;
    for (const line of T.hireSteps) {
      await wait(420);
      print(line, line.startsWith('✓') ? 't-p' : '');
    }
    await wait(500);
    busy = false;
    onHire?.();
  }

  function run(raw) {
    const cmd = raw.trim();
    echo(cmd);
    if (!cmd) return;
    history.push(cmd);
    hIdx = history.length;
    let key = cmd.toLowerCase().replace(/\s+/g, ' ');
    key = aliases[key] ?? key;
    if (['sudo hire-me', 'hire', 'hire-me'].includes(key)) return void hire();
    if (key.startsWith('echo ')) return print(esc(cmd.slice(5)));
    const fn = commands[key];
    if (fn) {
      const res = fn();
      if (res) print(res);
    } else {
      print(`<span class="t-err">${T.notFound}</span> ${esc(cmd)}. ${T.typeHelp} <span class="t-acc">help</span>.`);
    }
  }

  input.addEventListener('keydown', (e) => {
    if (busy) { e.preventDefault(); return; }
    if (e.key === 'Enter') {
      run(input.value);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hIdx > 0) input.value = history[--hIdx];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      hIdx = Math.min(history.length, hIdx + 1);
      input.value = history[hIdx] || '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const v = input.value.toLowerCase();
      const m = names.filter((n) => n.startsWith(v));
      if (m.length === 1) input.value = m[0];
      else if (m.length > 1) { echo(input.value); print(m.join('  '), 't-mut'); }
    }
  });

  root.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    if (window.getSelection()?.toString()) return;
    input.focus({ preventScroll: true });
  });

  print(`<span class="t-acc">Fabrice OS</span> v26.10 — <span class="t-mut">${T.connected}</span>`);
  print(`${T.start}<br>&nbsp;`);

  // démo auto-tapée la première fois que le terminal est visible
  let demoDone = false;
  return {
    async demo() {
      if (demoDone) return;
      demoDone = true;
      busy = true;
      for (const ch of 'whoami') {
        input.value += ch;
        await wait(90 + Math.random() * 80);
      }
      await wait(300);
      busy = false;
      run(input.value);
      input.value = '';
    },
  };
}
