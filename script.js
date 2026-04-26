/* NUI helpers for FiveM */
function closePanel() {
    try {
        fetch(`https://${GetParentResourceName()}/close`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({})
        }).catch(() => {});
    } catch (_) {
        // Running outside FiveM (preview in browser) - ignore
    }
    document.body.style.display = 'none';
}

window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || !data.action) return;
    if (data.action === 'open') {
        document.body.style.display = 'block';
    } else if (data.action === 'close') {
        document.body.style.display = 'none';
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
});

// --- Performance helpers ---
let _iconsScheduled = false;
function scheduleIcons() {
    if (_iconsScheduled) return;
    _iconsScheduled = true;
    requestAnimationFrame(() => {
        _iconsScheduled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
}

// --- CONSTANTES E DADOS INICIAIS ---
const HIERARCHY = ['Estagiário(a)', 'Enfermeiro(a)', 'Médico(a) Residente', 'Médico(a) Especialista', 'Chefe de Serviço', 'Diretor Clínico'];

let isDarkMode = false;
let activeTab = 'home';

const _rendered = {
    nav: false,
    avisos: false,
    contratacao: false,
    funcionarios: false,
    rankings: false,
    builder: false
};

const _dirty = {
    avisos: true,
    contratacao: true,
    funcionarios: true,
    rankings: true,
    builder: true
};

let avisos = [
    { id: 1, title: 'Atualização Protocolo de Urgência', content: 'Revisão obrigatória do novo manual de triagem para todos os enfermeiros e médicos do turno da noite.', type: 'urgente', date: 'Hoje, 09:00' },
    { id: 2, title: 'Manutenção Equipamentos', content: 'O Raio-X da sala 3 estará em manutenção programada durante a tarde de sexta-feira.', type: 'normal', date: 'Ontem, 14:30' }
];

let funcionarios = [
    { id: 1, name: 'Marta Costa', role: 'Diretor Clínico', department: 'Administração', status: 'Em Serviço', score: 99 },
    { id: 2, name: 'Ana Silva', role: 'Médico(a) Especialista', department: 'Cardiologia', status: 'Em Serviço', score: 95 },
    { id: 3, name: 'Sofia Pires', role: 'Chefe de Serviço', department: 'Neurologia', status: 'Em Serviço', score: 92 },
    { id: 4, name: 'João Santos', role: 'Enfermeiro(a)', department: 'Urgência', status: 'Ausente', score: 88 },
    { id: 5, name: 'Pedro Gomes', role: 'Estagiário(a)', department: 'Pediatria', status: 'Em Serviço', score: 75 }
];

let customFields = [
    { id: 'q1', label: 'Qual a sua principal motivação para juntar-se à nossa equipa?', type: 'text' },
    { id: 'q2', label: 'Possui certificação BLS/ACLS válida?', type: 'select', options: ['Sim', 'Não'] }
];

let candidates = [
    { id: 101, name: 'Carlos Lima', role: 'Enfermeiro(a)', department: 'Urgência', date: 'Hoje', status: 'Pendente', answers: { q1: 'Procuro um ambiente dinâmico e focado no cuidado de excelência ao paciente.', q2: 'Sim' } },
    { id: 102, name: 'Beatriz Sousa', role: 'Médico(a) Residente', department: 'Pediatria', date: 'Ontem', status: 'Pendente', answers: { q1: 'A reputação do vosso hospital na área da pediatria é incomparável.', q2: 'Sim' } },
    { id: 103, name: 'Rui Mendes', role: 'Estagiário(a)', department: 'Triagem', date: '23/04/2026', status: 'Rejeitado', answers: { q1: 'Preciso de experiência inicial.', q2: 'Não' } }
];

const NAV_ITEMS = [
    { id: 'home', icon: 'home', label: 'Visão Geral' },
    { id: 'avisos', icon: 'message-square', label: 'Mural de Avisos' },
    { id: 'contratacao', icon: 'user-plus', label: 'Admissão (RH)' },
    { id: 'funcionarios', icon: 'users', label: 'Equipa' },
    { id: 'rankings', icon: 'trophy', label: 'Rankings' }
];

// --- INICIALIZAÇÃO ---
window.addEventListener('load', () => {
    // Outside FiveM (regular browser), show UI by default
    const isFiveM = typeof GetParentResourceName === 'function';
    if (!isFiveM) {
        document.body.style.display = 'block';
    }

    applyTestModelToCandidates();
    applyThemeBackground();
    renderNavMenu();
    // Lazy render: only render active tab initially
    setActiveTab(activeTab);
    scheduleIcons();
});

// --- TEMA E NAVEGAÇÃO ---
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', isDarkMode);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.setAttribute('data-lucide', isDarkMode ? 'sun' : 'moon');
    applyThemeBackground();
    scheduleIcons();
}

function applyThemeBackground() {
    const wrapper = document.getElementById('app-wrapper');
    if (!wrapper) return;
    wrapper.style.backgroundBlendMode = isDarkMode ? 'overlay' : 'normal';
    wrapper.style.backgroundColor = isDarkMode ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.7)';
}

function renderNavMenu() {
    const menu = document.getElementById('nav-menu');
    if (!menu) return;
    menu.innerHTML = NAV_ITEMS.map(tab => `
        <button onclick="setActiveTab('${tab.id}')" id="nav-${tab.id}" class="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl transition-all duration-200 text-left w-full relative ${activeTab === tab.id ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-600/20 dark:text-blue-400' : 'hover:bg-slate-500/10 opacity-70 hover:opacity-100'}">
            <i data-lucide="${tab.icon}" class="w-5 h-5 ${activeTab !== tab.id ? 'scale-95' : ''}"></i>
            <span class="hidden sm:block">${tab.label}</span>
            ${activeTab === tab.id ? '<div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-blue-500 rounded-r-full"></div>' : ''}
        </button>
    `).join('');
    _rendered.nav = true;
    scheduleIcons();
}

function setActiveTab(tabId) {
    activeTab = tabId;
    NAV_ITEMS.forEach(t => {
        const el = document.getElementById(`tab-${t.id}`);
        if (el) el.classList.add('hidden');
    });
    const tabEl = document.getElementById(`tab-${tabId}`);
    if (tabEl) tabEl.classList.remove('hidden');
    const title = document.getElementById('window-title');
    if (title) title.innerText = `HOSPITAL SYSTEM OS // ${tabId.toUpperCase()}`;
    renderNavMenu();

    // Lazy render per tab
    if (tabId === 'avisos' && (!_rendered.avisos || _dirty.avisos)) {
        renderAvisos();
        _rendered.avisos = true;
        _dirty.avisos = false;
    }
    if (tabId === 'contratacao' && (!_rendered.contratacao || _dirty.contratacao)) {
        renderCandidates();
        _rendered.contratacao = true;
        _dirty.contratacao = false;
    }
    if (tabId === 'funcionarios' && (!_rendered.funcionarios || _dirty.funcionarios)) {
        renderFuncionarios();
        _rendered.funcionarios = true;
        _dirty.funcionarios = false;
    }
    if (tabId === 'rankings' && (!_rendered.rankings || _dirty.rankings)) {
        renderRankings();
        _rendered.rankings = true;
        _dirty.rankings = false;
    }
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.toggle('hidden');
    if (modalId === 'modal-aviso' && !modal.classList.contains('hidden')) {
        const t = document.getElementById('aviso-title');
        const c = document.getElementById('aviso-content');
        if (t) t.value = '';
        if (c) c.value = '';
        validateAviso();
    }
    if (modalId === 'modal-builder' && !modal.classList.contains('hidden')) {
        if (!_rendered.builder || _dirty.builder) {
            renderBuilderFields();
            _rendered.builder = true;
            _dirty.builder = false;
        }
        validateNewField();
    }
}

// --- MURAL DE AVISOS ---
function renderAvisos() {
    const grid = document.getElementById('avisos-grid');
    if (!grid) return;
    grid.innerHTML = avisos.map(aviso => `
        <div class="p-5 rounded-xl border backdrop-blur-sm relative overflow-hidden transition-all hover:shadow-md bg-white/80 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700/50">
            <div class="absolute top-0 left-0 w-1 h-full ${aviso.type === 'urgente' ? 'bg-red-500' : 'bg-green-500'}"></div>
            <div class="flex justify-between items-start mb-2 pl-2">
                <h3 class="font-semibold text-lg flex items-center gap-2">
                    ${aviso.type === 'urgente' ? '<i data-lucide="alert-circle" class="w-4 h-4 text-red-500"></i>' : ''}
                    ${aviso.title}
                </h3>
                <span class="text-xs text-slate-500 dark:text-slate-400">${aviso.date}</span>
            </div>
            <p class="pl-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">${aviso.content}</p>
        </div>
    `).join('');
    scheduleIcons();
}

function validateAviso() {
    const title = (document.getElementById('aviso-title')?.value || '').trim();
    const content = (document.getElementById('aviso-content')?.value || '').trim();
    const btn = document.getElementById('btn-pub-aviso');
    if (btn) btn.disabled = !(title && content);
}

function handleAddAviso() {
    const title = document.getElementById('aviso-title')?.value || '';
    const content = document.getElementById('aviso-content')?.value || '';
    const type = document.getElementById('aviso-type')?.value || 'normal';

    avisos.unshift({
        id: Date.now(),
        title,
        content,
        type,
        date: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    });
    if (activeTab === 'avisos') {
        renderAvisos();
        _dirty.avisos = false;
        _rendered.avisos = true;
    } else {
        _dirty.avisos = true;
    }
    toggleModal('modal-aviso');
}

// --- RH / CONTRATAÇÃO (PAINEL DE RESPOSTAS) ---
function getTestAnswerForField(candidate, field, index) {
    if (field.type === 'select') return index % 2 === 0 ? 'Sim' : 'Não';
    return `${candidate.name}: resposta de teste para "${field.label}". Tenho experiência clínica e disponibilidade para início imediato.`;
}

function applyTestModelToCandidates() {
    candidates.forEach((candidate, index) => {
        if (!candidate.answers || typeof candidate.answers !== 'object') candidate.answers = {};
        customFields.forEach(field => {
            if (!candidate.answers[field.id]) {
                candidate.answers[field.id] = getTestAnswerForField(candidate, field, index);
            }
        });
    });
}

function setCandidateViewMode(mode) {
    const listView = document.getElementById('candidates-list-view');
    const detailView = document.getElementById('candidate-detail-view');
    if (!listView || !detailView) return;

    if (mode === 'detail') {
        listView.classList.add('hidden');
        detailView.classList.remove('hidden');
    } else {
        detailView.classList.add('hidden');
        listView.classList.remove('hidden');
    }
}

function openCandidateFromButton(id, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    viewCandidate(id);
}

function renderCandidates() {
    const tbody = document.getElementById('candidates-tbody');
    if (!tbody) return;

    if (candidates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center opacity-50">Nenhuma candidatura recebida ainda.</td></tr>';
    } else {
        tbody.innerHTML = candidates.map(c => {
            let statusClass =
                c.status === 'Pendente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                c.status === 'Aprovado' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
            return `
                <tr class="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                    <td class="p-4 font-medium">${c.name}</td>
                    <td class="p-4">
                        <div class="text-sm font-medium">${c.role}</div>
                        <div class="text-xs opacity-60">${c.department}</div>
                    </td>
                    <td class="p-4 text-center text-sm opacity-80">${c.date}</td>
                    <td class="p-4 text-center">
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">${c.status}</span>
                    </td>
                    <td class="p-4 text-right">
                        <button onclick="openCandidateFromButton(${c.id}, event)" class="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="Ver Respostas">
                            <i data-lucide="eye" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    scheduleIcons();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function viewCandidate(id) {
    try {
        const c = candidates.find(cand => cand.id === id);
        if (!c) {
            setCandidateViewMode('list');
            return;
        }
        applyTestModelToCandidates();

        document.getElementById('detail-name').innerText = c.name;
        document.getElementById('detail-role').innerText = `${c.role} • ${c.department}`;

        let statusClass =
            c.status === 'Pendente' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800' :
            c.status === 'Aprovado' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800' :
            'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800';
        document.getElementById('detail-status-badge').innerHTML =
            `<span class="px-3 py-1 rounded-full border text-sm font-semibold ${statusClass}">${c.status}</span>`;

        const answersHtml = customFields.map((f, i) => {
            const answer = c.answers && c.answers[f.id]
                ? escapeHtml(c.answers[f.id])
                : '<span class="italic opacity-50">Candidato não respondeu</span>';
            return `
                <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-2">
                        <span class="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-2 py-0.5 rounded text-xs mt-0.5 shrink-0">Pergunta ${i + 1}</span>
                        <span class="leading-relaxed">${escapeHtml(f.label)}</span>
                    </p>
                    <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <p class="text-slate-700 dark:text-slate-300 leading-relaxed">${answer}</p>
                    </div>
                </div>
            `;
        }).join('');
        document.getElementById('detail-answers').innerHTML =
            answersHtml || '<p class="opacity-50">Nenhuma pergunta configurada no construtor.</p>';

        const actionsDiv = document.getElementById('detail-actions');
        if (c.status === 'Pendente') {
            actionsDiv.innerHTML = `
                <button onclick="rejectCandidate(${c.id})" class="px-5 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    Recusar Candidato
                </button>
                <button onclick="approveCandidate(${c.id})" class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all shadow-md flex items-center gap-2">
                    <i data-lucide="check-circle" class="w-4 h-4"></i>
                    Aprovar & Admitir
                </button>
            `;
        } else {
            actionsDiv.innerHTML = `<p class="text-sm opacity-60 italic py-2">Processo de avaliação concluído.</p>`;
        }

        setCandidateViewMode('detail');
        scheduleIcons();
    } catch (error) {
        console.error('Erro ao abrir candidato:', error);
        setCandidateViewMode('list');
        const tbody = document.getElementById('candidates-tbody');
        if (tbody) {
            tbody.insertAdjacentHTML('afterbegin', '<tr><td colspan="5" class="p-3 text-center text-xs text-red-500">Erro ao abrir detalhes do candidato. Tente novamente.</td></tr>');
        }
    }
}

function closeCandidateView() {
    setCandidateViewMode('list');
}

function approveCandidate(id) {
    if (!confirm('Tem a certeza que deseja aprovar e admitir este candidato? Esta ação irá adicioná-lo à sua equipa.')) return;

    const c = candidates.find(cand => cand.id === id);
    if (c) {
        c.status = 'Aprovado';
        funcionarios.push({
            id: Date.now(),
            name: c.name,
            role: c.role,
            department: c.department,
            status: 'Em Serviço',
            score: 50
        });
        if (activeTab === 'contratacao') {
            renderCandidates();
            viewCandidate(id);
            _dirty.contratacao = false;
            _rendered.contratacao = true;
        } else {
            _dirty.contratacao = true;
        }

        // Mark dependent tabs dirty; only rerender if visible
        if (activeTab === 'funcionarios') {
            renderFuncionarios();
            _dirty.funcionarios = false;
            _rendered.funcionarios = true;
        } else {
            _dirty.funcionarios = true;
        }
        if (activeTab === 'rankings') {
            renderRankings();
            _dirty.rankings = false;
            _rendered.rankings = true;
        } else {
            _dirty.rankings = true;
        }
    }
}

function rejectCandidate(id) {
    if (!confirm('Tem a certeza que deseja recusar esta candidatura? Esta ação é irreversível.')) return;

    const c = candidates.find(cand => cand.id === id);
    if (c) {
        c.status = 'Rejeitado';
        if (activeTab === 'contratacao') {
            renderCandidates();
            viewCandidate(id);
            _dirty.contratacao = false;
            _rendered.contratacao = true;
        } else {
            _dirty.contratacao = true;
        }
    }
}

// Builder RH
function renderBuilderFields() {
    const list = document.getElementById('builder-fields-list');
    if (!list) return;

    if (customFields.length === 0) {
        list.innerHTML = '<p class="text-center text-sm opacity-50 py-4">Nenhuma pergunta configurada.</p>';
    } else {
        list.innerHTML = customFields.map((f, i) => `
            <div class="p-3 rounded-lg border flex items-center justify-between bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700">
                <div>
                    <span class="text-xs font-bold opacity-50 mr-2">#${i + 1}</span>
                    <span class="font-medium text-sm">${f.label}</span>
                    <span class="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">${f.type === 'text' ? 'Texto' : 'Opção'}</span>
                </div>
                <button onclick="handleRemoveCustomField('${f.id}')" class="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 p-1.5 rounded-md transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        `).join('');
    }
    scheduleIcons();
}

function validateNewField() {
    const val = (document.getElementById('new-field-label')?.value || '').trim();
    const btn = document.getElementById('btn-add-field');
    if (btn) btn.disabled = !val;
}

function handleAddCustomField() {
    const label = document.getElementById('new-field-label')?.value || '';
    const type = document.getElementById('new-field-type')?.value || 'text';
    customFields.push({ id: 'q' + Date.now(), label, type, options: type === 'select' ? ['Sim', 'Não'] : [] });
    applyTestModelToCandidates();
    const inp = document.getElementById('new-field-label');
    if (inp) inp.value = '';
    validateNewField();
    // Builder tab isn't a tab; render immediately only if modal open
    const modal = document.getElementById('modal-builder');
    if (modal && !modal.classList.contains('hidden')) {
        renderBuilderFields();
        _dirty.builder = false;
        _rendered.builder = true;
    } else {
        _dirty.builder = true;
    }

    // Candidate details depend on fields; mark contratacao dirty
    _dirty.contratacao = true;
}

function handleRemoveCustomField(id) {
    customFields = customFields.filter(f => f.id !== id);
    const modal = document.getElementById('modal-builder');
    if (modal && !modal.classList.contains('hidden')) {
        renderBuilderFields();
        _dirty.builder = false;
        _rendered.builder = true;
    } else {
        _dirty.builder = true;
    }
    _dirty.contratacao = true;
}

// --- EQUIPA ---
function renderFuncionarios() {
    const total = document.getElementById('equipa-total');
    if (total) total.innerText = `Total: ${funcionarios.length} ativos`;
    const tbody = document.getElementById('funcionarios-tbody');
    if (!tbody) return;

    if (funcionarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center opacity-50">Nenhum funcionário na base de dados.</td></tr>';
    } else {
        tbody.innerHTML = funcionarios.map(f => {
            const isTopRole = f.role === HIERARCHY[HIERARCHY.length - 1];
            const isBotRole = f.role === HIERARCHY[0];
            const statusClass = f.status === 'Em Serviço'
                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800'
                : 'bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600';
            const dotClass = f.status === 'Em Serviço' ? 'bg-green-500 animate-pulse' : 'bg-slate-400';
            const initials = f.name.split(' ').map(n => n[0]).join('').substring(0, 2);

            return `
                <tr class="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60">
                    <td class="p-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                ${initials}
                            </div>
                            <span class="font-medium">${f.name}</span>
                        </div>
                    </td>
                    <td class="p-4">
                        <div class="flex items-center gap-2">
                            <span class="text-sm">${f.role}</span>
                            <div class="flex flex-col">
                                <button onclick="changeRole(${f.id}, 'up')" ${isTopRole ? 'disabled' : ''} class="text-slate-400 hover:text-green-500 disabled:opacity-20"><i data-lucide="chevron-up" class="w-3.5 h-3.5"></i></button>
                                <button onclick="changeRole(${f.id}, 'down')" ${isBotRole ? 'disabled' : ''} class="text-slate-400 hover:text-red-500 disabled:opacity-20"><i data-lucide="chevron-down" class="w-3.5 h-3.5"></i></button>
                            </div>
                        </div>
                    </td>
                    <td class="p-4 text-sm opacity-80">${f.department}</td>
                    <td class="p-4 text-center">
                        <button onclick="toggleStatus(${f.id})" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 border ${statusClass}">
                            <span class="w-1.5 h-1.5 rounded-full mr-1.5 ${dotClass}"></span>${f.status}
                        </button>
                    </td>
                    <td class="p-4 text-right">
                        <button onclick="fireEmployee(${f.id})" class="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Demitir">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    scheduleIcons();
}

function toggleStatus(id) {
    const emp = funcionarios.find(f => f.id === id);
    if (emp) emp.status = emp.status === 'Em Serviço' ? 'Ausente' : 'Em Serviço';
    if (activeTab === 'funcionarios') {
        renderFuncionarios();
        _dirty.funcionarios = false;
        _rendered.funcionarios = true;
    } else {
        _dirty.funcionarios = true;
    }
}

function changeRole(id, direction) {
    const emp = funcionarios.find(f => f.id === id);
    if (emp) {
        let idx = HIERARCHY.indexOf(emp.role);
        if (direction === 'up' && idx < HIERARCHY.length - 1) idx++;
        if (direction === 'down' && idx > 0) idx--;
        emp.role = HIERARCHY[idx];
        if (activeTab === 'funcionarios') {
            renderFuncionarios();
            _dirty.funcionarios = false;
            _rendered.funcionarios = true;
        } else {
            _dirty.funcionarios = true;
        }
        if (activeTab === 'rankings') {
            renderRankings();
            _dirty.rankings = false;
            _rendered.rankings = true;
        } else {
            _dirty.rankings = true;
        }
    }
}

function fireEmployee(id) {
    if (confirm('Tem a certeza que deseja remover este funcionário dos quadros?')) {
        funcionarios = funcionarios.filter(f => f.id !== id);
        if (activeTab === 'funcionarios') {
            renderFuncionarios();
            _dirty.funcionarios = false;
            _rendered.funcionarios = true;
        } else {
            _dirty.funcionarios = true;
        }
        if (activeTab === 'rankings') {
            renderRankings();
            _dirty.rankings = false;
            _rendered.rankings = true;
        } else {
            _dirty.rankings = true;
        }
    }
}

// --- RANKINGS ---
function renderRankings() {
    const sorted = [...funcionarios].sort((a, b) => b.score - a.score);
    const top3 = sorted.slice(0, 3);
    const rest = sorted.slice(3);

    const podiumContainer = document.getElementById('podium-container');
    if (podiumContainer) {
        if (top3.length > 0) {
            const order = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
            podiumContainer.innerHTML = order.map(f => {
                const idx = top3.indexOf(f);
                const isGold = idx === 0;
                const isSilver = idx === 1;
                const isBronze = idx === 2;
                const height = isGold ? 'h-48' : isSilver ? 'h-36' : 'h-28';
                const colors = isGold
                    ? 'bg-gradient-to-t from-yellow-500/20 to-yellow-300/50 border-yellow-400 text-yellow-600 dark:text-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)] z-10'
                    : isSilver
                        ? 'bg-gradient-to-t from-slate-400/20 to-slate-300/50 border-slate-300 text-slate-500 dark:text-slate-300'
                        : 'bg-gradient-to-t from-orange-600/20 to-orange-400/50 border-orange-400 text-orange-600 dark:text-orange-400';
                const scoreColor = isGold ? 'text-yellow-500' : isSilver ? 'text-slate-400' : 'text-orange-500';

                return `
                    <div class="flex flex-col items-center group">
                        <div class="relative flex flex-col items-center mb-4 p-3 rounded-xl border backdrop-blur-md transition-transform group-hover:-translate-y-2 bg-white/90 dark:bg-slate-800/80 shadow-lg">
                            ${isGold ? '<div class="absolute -top-6 text-yellow-500 animate-bounce"><i data-lucide="medal" class="w-8 h-8"></i></div>' : ''}
                            <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-lg mb-2 overflow-hidden border-2 border-transparent">
                                ${f.name.charAt(0)}
                            </div>
                            <span class="font-bold text-sm sm:text-base text-center w-20 sm:w-28 truncate">${f.name}</span>
                            <span class="text-xs opacity-70 truncate w-full text-center">${f.role}</span>
                            <span class="mt-2 font-black text-lg ${scoreColor}">${f.score} pts</span>
                        </div>
                        <div class="w-24 sm:w-32 rounded-t-lg border-t-4 border-l border-r backdrop-blur-sm ${height} ${colors} flex items-start justify-center pt-4">
                            <span class="font-black text-4xl opacity-50">${idx + 1}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            podiumContainer.innerHTML = '';
        }
    }

    const listContainer = document.getElementById('rankings-list');
    if (listContainer) {
        if (rest.length > 0) {
            listContainer.innerHTML = rest.map((f, i) => `
                <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-500/5 transition-colors">
                    <div class="flex items-center gap-4">
                        <span class="w-6 text-center font-bold opacity-40">${i + 4}º</span>
                        <div>
                            <p class="font-semibold">${f.name}</p>
                            <p class="text-xs opacity-60">${f.department}</p>
                        </div>
                    </div>
                    <div class="font-bold font-mono bg-slate-500/10 px-3 py-1 rounded-lg">
                        ${f.score} pts
                    </div>
                </div>
            `).join('');
        } else {
            listContainer.innerHTML = '';
        }
    }
    scheduleIcons();
}

