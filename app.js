const data = 보도자료;   // 데이터.js 에서 불러옴 (fetch 없이 동작 - 로컬 더블클릭 가능)
const q = document.getElementById('q');
const list = document.getElementById('list');
const count = document.getElementById('count');
const filters = document.getElementById('filters');
let dept = '전체';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 원문을 이스케이프하면서 검색어 강조 (짝수 조각 = 일반 텍스트, 홀수 조각 = 일치 부분)
function mark(text, kw) {
  if (!kw) return esc(text);
  return String(text).split(new RegExp(`(${reEsc(kw)})`, 'gi'))
    .map((part, i) => i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join('');
}

// 본문 마크다운 간이 렌더링: 첫 # 제목(카드 제목과 중복) 제거, **굵게**, 문단, --- 제거
function renderBody(md, kw) {
  const text = md.replace(/^#\s.*\n+/, '').replace(/\n*-{3,}\s*$/, '').trim();
  return text.split(/\n{2,}/).map(p =>
    `<p>${mark(p, kw).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`
  ).join('');
}

function matches(a, kw) {
  if (!kw) return true;
  const k = kw.toLowerCase();
  return [a.본문, a.제목, a.부처].some(v => v.toLowerCase().includes(k));
}

function update() {
  const kw = q.value.trim();
  const filtered = data.filter(a => (dept === '전체' || a.부처 === dept) && matches(a, kw));
  render(filtered, kw);
}

function render(arr, kw) {
  count.textContent = `결과 ${arr.length}건`;
  list.innerHTML = arr.length ? arr.map(a => `
    <article class="card">
      <div class="meta"><span class="label">${mark(a.부처, kw)}</span><span class="no">보도자료 ${esc(a.번호)}</span></div>
      <h2 class="title">${mark(a.제목, kw)}</h2>
      <div class="body">${renderBody(a.본문, kw)}</div>
    </article>`).join('')
    : '<p class="empty">검색 결과가 없습니다.</p>';
}

['전체', ...new Set(data.map(a => a.부처))].forEach(name => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = name;
  b.setAttribute('aria-pressed', name === dept);
  b.addEventListener('click', () => {
    dept = name;
    filters.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    update();
  });
  filters.appendChild(b);
});

q.addEventListener('input', update);
update();
