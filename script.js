/* NUI helpers for FiveM */
function closePanel() {
    fetch(`https://${GetParentResourceName()}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify({})
    }).catch(err => console.warn('NUI close failed', err));
    document.body.style.display = 'none';
}

window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || !data.action) return;
    if (data.action === 'open') {
        document.body.style.display = 'flex';
    } else if (data.action === 'close') {
        document.body.style.display = 'none';
    }
});

// Close on Escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
});

// --- Tema macOS ---
function toggleTheme() {
    const body = document.documentElement;
    const btn = document.getElementById('themeBtn');
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        btn.innerHTML = '<i class="fa-solid fa-moon"></i> Aspecto Escuro';
    } else {
        body.setAttribute('data-theme', 'dark');
        btn.innerHTML = '<i class="fa-solid fa-sun"></i> Aspecto Claro';
    }
}

// --- Navegação e Modais ---
function showTab(tabId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function toggleModal(id, show) {
    document.getElementById(id).style.display = show ? 'flex' : 'none';
}

window.onclick = function(event) {
    if (!event.target.classList.contains('modal')) return;
    if (event.target.id === 'modal-mudar-cargo') {
        cancelarMudancaCargo();
        return;
    }
    if (event.target.id === 'modal-demitir-funcionario') {
        cancelarDemissao();
        return;
    }
    event.target.style.display = 'none';
}

// --- CÉREBRO DO MURAL DE AVISOS ---
function criarAviso(event) {
    event.preventDefault();

    const titulo = document.getElementById('aviso-titulo').value;
    const mensagem = document.getElementById('aviso-mensagem').value;
    const prioridade = document.getElementById('aviso-prioridade').value;

    const grid = document.getElementById('mural-grid');
    
    let tagHTML = '';
    if (prioridade === 'urgente') {
        tagHTML = `<span style="color: var(--apple-red); font-weight: 600;"><i class="fa-solid fa-circle-exclamation"></i> Urgente</span>`;
    } else {
        tagHTML = `<span style="color: var(--apple-green); font-weight: 600;"><i class="fa-solid fa-circle-info"></i> Informativo</span>`;
    }

    const novoCard = document.createElement('div');
    novoCard.className = 'mac-card';
    novoCard.style.animation = 'fadeIn 0.4s ease';
    novoCard.innerHTML = `
        <div class="mac-card-header">
            ${tagHTML}
            <small>Agora mesmo</small>
        </div>
        <h3 style="margin-bottom: 10px; font-size: 1.15rem; color: var(--text-main);">${titulo}</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5;">${mensagem}</p>
    `;

    grid.insertBefore(novoCard, grid.firstChild);

    toggleModal('modal-novo-aviso', false);
    document.getElementById('form-aviso').reset();
}

// --- CÉREBRO DA SINCRONIZAÇÃO (RH) ---
let perguntasPersonalizadas = [];
let contadorPerguntas = 0;

function adicionarPergunta() {
    const inputPergunta = document.getElementById('nova-pergunta');
    const selectTipo = document.getElementById('tipo-resposta');

    const textoPergunta = inputPergunta.value.trim();
    const tipoTexto = selectTipo.options[selectTipo.selectedIndex].text;
    const tipoValor = selectTipo.value;

    if (textoPergunta === '') {
        alert('Insira o título da pergunta.');
        return;
    }

    contadorPerguntas++;
    perguntasPersonalizadas.push({
        id: 'perg-' + contadorPerguntas,
        titulo: textoPergunta,
        tipoValor: tipoValor,
        tipoTexto: tipoTexto
    });

    inputPergunta.value = '';
    renderizarPerguntas();
}

function removerPergunta(idParaRemover) {
    perguntasPersonalizadas = perguntasPersonalizadas.filter(p => p.id !== idParaRemover);
    renderizarPerguntas();
}

function renderizarPerguntas() {
    const listaModal = document.getElementById('perguntas-dinamicas-modal');
    const listaStepper = document.getElementById('campos-dinamicos-stepper');

    listaModal.innerHTML = '';
    listaStepper.innerHTML = '';

    perguntasPersonalizadas.forEach(p => {
        let icone = 'fa-align-left';
        if (p.tipoValor === 'paragrafo') icone = 'fa-align-justify';
        if (p.tipoValor === 'multipla') icone = 'fa-chevron-down';
        if (p.tipoValor === 'anexo') icone = 'fa-paperclip';

        listaModal.innerHTML += `
            <div class="question-item">
                <div class="question-info">
                    <strong>${p.titulo}</strong>
                    <small><i class="fa-solid ${icone}"></i> ${p.tipoTexto}</small>
                </div>
                <button class="btn-delete" onclick="removerPergunta('${p.id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        let campoHTML = '';
        if (p.tipoValor === 'texto') campoHTML = `<input type="text" placeholder="Resposta...">`;
        else if (p.tipoValor === 'paragrafo') campoHTML = `<textarea rows="2" placeholder="Resposta..."></textarea>`;
        else if (p.tipoValor === 'multipla') campoHTML = `<select><option value="">Selecionar...</option><option>Sim</option><option>Não</option></select>`;
        else if (p.tipoValor === 'anexo') campoHTML = `<input type="file" style="padding:7px; background: transparent; border: 1px dashed var(--border-element); box-shadow: none; color: var(--text-main);">`;

        listaStepper.innerHTML += `
            <div class="form-group" style="animation: fadeIn 0.3s ease;">
                <label>${p.titulo}</label>
                ${campoHTML}
            </div>
        `;
    });
}

// --- CÉREBRO DO STEPPER (RH) ---
let currentStep = 1;
let hiringData = {};

function validateStep1() {
    const exp = document.getElementById('h-experiencia').value.trim();
    const disp = document.getElementById('h-disponibilidade').value;
    document.getElementById('btn-next-1').disabled = !(exp !== '' && disp !== '');
}

function validateStep2() {
    const nome = document.getElementById('h-nome').value.trim();
    const doc = document.getElementById('h-id-pessoal').value.trim();
    document.getElementById('btn-next-2').disabled = !(nome !== '' && doc !== '');
}

function validateStep3() {
    const idHosp = document.getElementById('h-id-hospital').value.trim();
    document.getElementById('btn-finish').disabled = !(idHosp !== '');
}

function updateProgressBar() {
    document.getElementById('progress-line').style.width = ((currentStep - 1) / 2) * 100 + '%';
    for (let i = 1; i <= 3; i++) {
        const circle = document.getElementById(`circle-${i}`);
        if (i < currentStep) {
            circle.classList.add('completed');
            circle.classList.remove('active');
            circle.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else if (i === currentStep) {
            circle.classList.add('active');
            circle.classList.remove('completed');
            circle.innerHTML = i;
        } else {
            circle.classList.remove('active', 'completed');
            circle.innerHTML = i;
        }
    }
}

function nextStep(step) {
    if (step === 2) {
        hiringData.nome = document.getElementById('h-nome').value;
        hiringData.idPessoal = document.getElementById('h-id-pessoal').value;
        document.getElementById('summary-nome').innerText = hiringData.nome;
        document.getElementById('summary-id').innerText = hiringData.idPessoal;
    }
    document.getElementById(`step-${step}`).classList.remove('active');
    currentStep++;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    updateProgressBar();
}

function prevStep(step) {
    document.getElementById(`step-${step}`).classList.remove('active');
    currentStep--;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    updateProgressBar();
}

function finishHiring() {
    hiringData.idHospital = document.getElementById('h-id-hospital').value;
    document.getElementById('success-nome').innerText = hiringData.nome;
    document.getElementById('success-id').innerText = hiringData.idHospital;
    document.getElementById('step-3').classList.remove('active');
    document.getElementById('progress-container').style.display = 'none';
    document.getElementById('step-success').classList.add('active');
}

function resetHiringProcess() {
    currentStep = 1;
    hiringData = {};
    document.getElementById('h-experiencia').value = '';
    document.getElementById('h-motivo').value = '';
    document.getElementById('h-disponibilidade').value = '';
    document.getElementById('h-nome').value = '';
    document.getElementById('h-telefone').value = '';
    document.getElementById('h-id-pessoal').value = '';
    document.getElementById('h-id-hospital').value = '';
    validateStep1(); validateStep2(); validateStep3();
    document.getElementById('step-success').classList.remove('active');
    document.getElementById('progress-container').style.display = 'flex';
    document.getElementById('step-1').classList.add('active');
    updateProgressBar();
}

// ==========================================
// CÉREBRO: QUADRO DE FUNCIONÁRIOS
// ==========================================

// Hierarquia de cargos para a função Upar/Rebaixar
const hierarquiaCargos = [
    'Estagiário', 'Recepcionista', 'Segurança', 'Técnico de Enfermagem',
    'Enfermeiro', 'Enfermeiro Chefe', 'Médico Plantonista', 'Médico Cirurgião', 'Diretor Clínico'
];

// Base de Dados Simulada
let bdFuncionarios = [
    { id: 'MC-1042', nome: 'Dr. Roberto Alves', telefone: '(11) 99999-1111', cargo: 'Médico Cirurgião', ativo: true, contratadoEm: '2026-03-28' },
    { id: 'MC-1088', nome: 'Ana Souza Martins', telefone: '(11) 98888-2222', cargo: 'Enfermeiro Chefe', ativo: true, contratadoEm: '2026-04-10' },
    { id: 'MC-2005', nome: 'Carlos Lima', telefone: '(11) 97777-3333', cargo: 'Recepcionista', ativo: false, contratadoEm: '2026-04-18' },
    { id: 'MC-2101', nome: 'Dra. Beatriz Santos', telefone: '(11) 96666-4444', cargo: 'Médico Plantonista', ativo: true, contratadoEm: '2026-04-20' }
];
let mudancaCargoPendente = null;
let demissaoPendente = null;
let etapaDemissaoAtual = 1;

// 1. Renderizar a Tabela
function renderizarTabelaFuncionarios() {
    const tbody = document.getElementById('tabela-funcionarios-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (bdFuncionarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 30px;">Nenhum funcionário na base de dados.</td></tr>';
        return;
    }

    bdFuncionarios.forEach(func => {
        const statusBadge = func.ativo
            ? `<span class="emp-badge on" onclick="alternarStatus('${func.id}')" title="Clique para alterar status"><i class="fa-solid fa-circle-check"></i> Em Serviço</span>`
            : `<span class="emp-badge off" onclick="alternarStatus('${func.id}')" title="Clique para alterar status"><i class="fa-solid fa-moon"></i> Ausente</span>`;
        const opcoesCargo = hierarquiaCargos
            .map(cargo => `<option value="${cargo}" ${cargo === func.cargo ? 'selected' : ''}>${cargo}</option>`)
            .join('');

        tbody.innerHTML += `
            <tr>
                <td><span class="id-text">${func.id}</span></td>
                <td style="font-weight: 500;">${func.nome}</td>
                <td>
                    <select class="cargo-select" onchange="prepararMudancaCargo('${func.id}', this.value)">
                        ${opcoesCargo}
                    </select>
                </td>
                <td style="color: var(--text-muted);">${func.telefone}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="action-group" style="justify-content: flex-end;">
                        <button class="btn-icon danger" onclick="demitirFuncionario('${func.id}')" title="Demitir"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// 2. Alternar Status (On/Off)
function alternarStatus(id) {
    const func = bdFuncionarios.find(f => f.id === id);
    if (func) func.ativo = !func.ativo;
    renderizarTabelaFuncionarios();
}

// 3. Alterar Cargo (com confirmação em modal)
function prepararMudancaCargo(id, novoCargo) {
    const func = bdFuncionarios.find(f => f.id === id);
    if (!func) return;

    if (!hierarquiaCargos.includes(novoCargo)) {
        renderizarTabelaFuncionarios();
        return;
    }

    if (novoCargo === func.cargo) return;

    mudancaCargoPendente = {
        id: func.id,
        nome: func.nome,
        cargoAtual: func.cargo,
        novoCargo: novoCargo
    };

    document.getElementById('cargo-confirm-nome').innerText = func.nome;
    document.getElementById('cargo-confirm-atual').innerText = func.cargo;
    document.getElementById('cargo-confirm-novo').innerText = novoCargo;
    toggleModal('modal-mudar-cargo', true);
}

function confirmarMudancaCargo() {
    if (!mudancaCargoPendente) return;

    const func = bdFuncionarios.find(f => f.id === mudancaCargoPendente.id);
    if (func) {
        func.cargo = mudancaCargoPendente.novoCargo;
    }
    mudancaCargoPendente = null;
    toggleModal('modal-mudar-cargo', false);
    renderizarTabelaFuncionarios();
}

function cancelarMudancaCargo() {
    mudancaCargoPendente = null;
    toggleModal('modal-mudar-cargo', false);
    renderizarTabelaFuncionarios();
}

// 4. Demitir Funcionário
function demitirFuncionario(id) {
    const func = bdFuncionarios.find(f => f.id === id);
    if (!func) return;

    demissaoPendente = { id: func.id };
    document.getElementById('demissao-nome').innerText = func.nome;
    document.getElementById('demissao-id').innerText = func.id;
    document.getElementById('demissao-telefone').innerText = func.telefone;
    document.getElementById('demissao-cargo').innerText = func.cargo;
    document.getElementById('demissao-tempo').innerText = formatarTempoContratacao(func.contratadoEm);
    document.getElementById('demissao-motivo').value = '';
    document.getElementById('demissao-multa-nao').checked = true;
    document.getElementById('demissao-valor-multa').value = '';
    alternarCampoMulta();
    validarConfirmacaoDemissao();
    irParaEtapaDemissao(1);
    toggleModal('modal-demitir-funcionario', true);
}

function irParaEtapaDemissao(etapa) {
    etapaDemissaoAtual = etapa;
    document.getElementById('demissao-etapa-1').classList.toggle('active', etapa === 1);
    document.getElementById('demissao-etapa-2').classList.toggle('active', etapa === 2);
    document.getElementById('demissao-subtitulo').innerText = etapa === 1
        ? 'Etapa 1: Informações do Médico'
        : 'Etapa 2: Multa e Motivo da Demissão';
}

function diasDesdeContratacao(dataISO) {
    const hoje = new Date();
    const contratado = new Date(dataISO + 'T00:00:00');
    const diffMs = hoje - contratado;
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function formatarTempoContratacao(dataISO) {
    const dias = diasDesdeContratacao(dataISO);
    if (dias === 1) return '1 dia de contratado';
    return `${dias} dias de contratado`;
}

function alternarCampoMulta() {
    const aplicarMulta = document.getElementById('demissao-multa-sim').checked;
    const box = document.getElementById('demissao-multa-box');
    const select = document.getElementById('demissao-valor-multa');
    box.classList.toggle('show', aplicarMulta);
    if (!aplicarMulta) {
        select.value = '';
    }
    validarConfirmacaoDemissao();
}

function validarConfirmacaoDemissao() {
    const motivo = document.getElementById('demissao-motivo').value.trim();
    const aplicarMulta = document.getElementById('demissao-multa-sim').checked;
    const valorMulta = document.getElementById('demissao-valor-multa').value;
    const podeConfirmar = motivo !== '' && (!aplicarMulta || valorMulta !== '');
    document.getElementById('btn-confirmar-demissao').disabled = !podeConfirmar;
}

function confirmarDemissao() {
    if (!demissaoPendente) return;

    const aplicarMulta = document.getElementById('demissao-multa-sim').checked;
    const motivo = document.getElementById('demissao-motivo').value.trim();
    const valorMulta = document.getElementById('demissao-valor-multa').value;
    if (motivo === '') return;
    if (aplicarMulta && valorMulta === '') return;

    bdFuncionarios = bdFuncionarios.filter(f => f.id !== demissaoPendente.id);
    demissaoPendente = null;
    toggleModal('modal-demitir-funcionario', false);
    renderizarTabelaFuncionarios();
}

function cancelarDemissao() {
    demissaoPendente = null;
    etapaDemissaoAtual = 1;
    toggleModal('modal-demitir-funcionario', false);
}

// Iniciar a tabela quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
    renderizarTabelaFuncionarios();
});
