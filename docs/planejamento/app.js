'use strict';

const STORAGE_KEY = 'fdt:planejamento-b2b:2027:v1';
const stages = [
  { title: 'Sua empresa', description: 'Conte um pouco sobre seu negócio para personalizarmos as recomendações.', fields: [
    { key: 'segment', label: 'Qual é o segmento da sua empresa?', options: ['Indústria', 'Tecnologia / SaaS', 'Serviços B2B', 'Distribuição / Atacado', 'Outro B2B'] },
    { key: 'size', label: 'Quantos colaboradores sua empresa possui?', options: ['1–10', '11–50', '51–200', '201–500', 'Mais de 500', 'Prefiro não informar'] }
  ]},
  { title: 'Cenário atual', description: 'Entenda o ponto de partida da operação de marketing.', fields: [
    { key: 'currentBudget', label: 'Quanto sua empresa investe mensalmente em marketing hoje?', options: ['Até R$ 5 mil', 'R$ 5–15 mil', 'R$ 15–30 mil', 'R$ 30–60 mil', 'Acima de R$ 60 mil', 'Não sei'], help: 'Investimento total (mídia, serviços, tecnologia e produção), não apenas anúncios.' },
    { key: 'currentBudgetExact', label: 'Valor mensal exato, se souber (opcional)', type: 'number', min: 0, max: 1000000000, placeholder: 'Ex.: 20000', optional: true },
    { key: 'challenge', label: 'Qual é o principal desafio de marketing atualmente?', options: ['Gerar demanda', 'Melhorar qualidade dos leads', 'Aumentar conversão', 'Fortalecer marca', 'Estruturar estratégia'] },
    { key: 'tracking', label: 'A empresa acompanha a conversão de oportunidades em vendas?', options: ['Sim, temos dados', 'Parcialmente', 'Ainda não'] }
  ]},
  { title: 'Metas para 2027', description: 'Defina as metas e os recursos para o próximo ano.', fields: [
    { key: 'clients', label: 'Quantos novos clientes deseja conquistar em 2027?', type: 'number', min: 1, max: 100000, placeholder: 'Ex.: 24', optional: true, help: 'Se ainda não definiu, deixe em branco.' },
    { key: 'value', label: 'Qual o valor médio de um novo cliente? (R$)', type: 'number', min: 0, max: 1000000000, step: '0.01', placeholder: 'Ex.: 50000', optional: true, help: 'Se não souber, deixe em branco.' },
    { key: 'valueType', label: 'O valor representa:', options: ['Venda pontual', 'Receita anual de contrato'], optional: true },
    { key: 'nextBudget', label: 'Qual o orçamento mensal previsto para marketing em 2027?', options: ['Até R$ 5 mil', 'R$ 5–15 mil', 'R$ 15–30 mil', 'R$ 30–60 mil', 'Acima de R$ 60 mil', 'Indefinido'], help: 'Investimento total (mídia, serviços, tecnologia e produção), não apenas anúncios.' },
    { key: 'nextBudgetExact', label: 'Valor mensal exato, se souber (opcional)', type: 'number', min: 0, max: 1000000000, placeholder: 'Ex.: 20000', optional: true }
  ]},
  { title: 'Sua estratégia', description: 'Vamos transformar suas respostas em prioridades práticas.', fields: [
    { key: 'priority', label: 'Qual será a principal prioridade estratégica em 2027?', options: ['Aquisição', 'Conversão', 'Posicionamento', 'Expansão', 'Estruturação'] },
    { key: 'execution', label: 'Como sua empresa pretende executar o marketing em 2027?', options: ['Contratar uma agência', 'Trocar de agência', 'Ampliar parceiro atual', 'Equipe interna', 'Ainda estamos avaliando'] },
    { key: 'when', label: 'Quando pretende iniciar esse projeto?', options: ['Imediatamente', 'Nos próximos 3 meses', 'Primeiro semestre de 2027', 'Sem previsão'], showIf: answers => ['Contratar uma agência', 'Trocar de agência', 'Ampliar parceiro atual'].includes(answers.execution) }
  ]},
  { title: 'Identificação', description: 'Conclua com seus dados profissionais. As informações ficam salvas apenas neste navegador.', fields: [
    { key: 'leadName', label: 'Nome completo *', type: 'text', placeholder: 'Seu nome', minLength: 3, maxLength: 120, autocomplete: 'name' },
    { key: 'leadCompany', label: 'Empresa *', type: 'text', placeholder: 'Nome da empresa', maxLength: 150, autocomplete: 'organization' },
    { key: 'leadRole', label: 'Cargo *', type: 'select', placeholder: 'Selecione', options: ['CEO / Sócio / Diretor', 'Head / Gerente de Marketing', 'Coordenador', 'Analista', 'Outro'] },
    { key: 'leadEmail', label: 'E-mail corporativo *', type: 'email', placeholder: 'voce@empresa.com.br', maxLength: 160, autocomplete: 'email' },
    { key: 'leadPhone', label: 'WhatsApp com DDD *', type: 'tel', placeholder: '(21) 99999-9999', maxLength: 15, autocomplete: 'tel' },
    { key: 'leadBusinessModel', label: 'Qual é o seu modelo de negócio?*', type: 'select', placeholder: 'Selecione', options: ['B2B', 'B2C', 'B2B e B2C'] }
  ]}
];
const form = document.getElementById('planner-form');
const content = document.getElementById('step-content');
const error = document.getElementById('form-error');
const status = document.getElementById('save-status');
const fields = stages.flatMap(stage => stage.fields);
const isVisible = field => !field.showIf || field.showIf(state.answers);
const requiredField = field => !field.optional || (field.key === 'valueType' && state.answers.value !== undefined && state.answers.value !== '');
let state = { version: 1, year: 2027, step: 0, answers: {}, completed: false, updatedAt: null };
let storageAvailable = true;

function validAnswer(field, value) {
  if (value === '' || value === undefined) return !requiredField(field);
  if (field.options) return field.options.includes(value);
  if (field.type === 'number') return Number.isFinite(Number(value)) && Number(value) >= field.min && Number(value) <= field.max && (!!field.step || Number.isInteger(Number(value)));
  if (typeof value !== 'string' || value.length > field.maxLength || value.trim().length < (field.minLength || 1)) return false;
  if (field.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (field.type === 'tel') return /^\d{10,11}$/.test(value.replace(/\D/g, ''));
  return true;
}

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && saved.version === 1 && saved.year === 2027 && saved.answers && typeof saved.answers === 'object') {
    for (const field of fields) {
      if (validAnswer(field, saved.answers[field.key]) && saved.answers[field.key] !== undefined) state.answers[field.key] = String(saved.answers[field.key]);
    }
    state.step = Number.isInteger(saved.step) ? Math.max(0, Math.min(stages.length - 1, saved.step)) : 0;
    state.completed = saved.completed === true && fields.filter(isVisible).every(field => validAnswer(field, state.answers[field.key]));
    const firstIncomplete = stages.findIndex(stage => stage.fields.filter(isVisible).some(field => !validAnswer(field, state.answers[field.key])));
    if (firstIncomplete !== -1 && firstIncomplete < state.step) state.step = firstIncomplete;
    state.updatedAt = typeof saved.updatedAt === 'string' ? saved.updatedAt : null;
  }
} catch { storageAvailable = false; }

function persist() {
  state.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageAvailable = true;
    status.textContent = 'Respostas salvas neste navegador';
    return true;
  } catch {
    storageAvailable = false;
    status.textContent = 'Não foi possível salvar neste navegador';
    return false;
  }
}

function el(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createField(field) {
  const isChoice = !field.type;
  const container = el(isChoice ? 'fieldset' : 'div', 'field');
  const label = el(isChoice ? 'legend' : 'label', '', field.label);
  if (!isChoice) label.htmlFor = field.key;
  container.append(label);
  container.dataset.field = field.key;
  container.hidden = !isVisible(field);
  if (isChoice) {
    const grid = el('div', 'choice-grid');
    field.options.forEach((option, index) => {
      const choice = el('label', 'choice');
      const input = el('input');
      input.type = 'radio'; input.name = field.key; input.value = option;
      input.id = `${field.key}-${index}`; input.required = requiredField(field);
      input.checked = state.answers[field.key] === option;
      choice.append(input, el('span', '', option)); grid.append(choice);
    });
    container.append(grid);
  } else {
    const input = el(field.type === 'select' ? 'select' : 'input', field.type === 'select' ? 'select-input' : 'text-input');
    input.id = field.key; input.name = field.key; input.required = requiredField(field);
    if (field.type === 'select') {
      const placeholder = el('option', '', field.placeholder || 'Selecione');
      placeholder.value = ''; placeholder.disabled = true; input.append(placeholder);
      field.options.forEach(option => { const node = el('option', '', option); node.value = option; input.append(node); });
      input.value = state.answers[field.key] || '';
      const wrap = el('div', 'select-wrap'); wrap.append(input); container.append(wrap);
    } else {
      input.type = field.type; input.placeholder = field.placeholder;
      if (field.maxLength) input.maxLength = field.maxLength;
      if (field.minLength) input.minLength = field.minLength;
      if (field.autocomplete) input.autocomplete = field.autocomplete;
      if (field.type === 'tel') input.inputMode = 'tel';
      if (field.type === 'number') { input.min = field.min; input.max = field.max; input.step = field.step || '1'; input.inputMode = field.step ? 'decimal' : 'numeric'; }
      if (field.key === 'company') input.autocomplete = 'organization';
      input.value = state.answers[field.key] || ''; container.append(input);
    }
    if (field.help) input.setAttribute('aria-describedby', `${field.key}-help`);
  }
  if (field.help) { const help = el('p', 'field-help', field.help); help.id = `${field.key}-help`; container.append(help); }
  return container;
}

function render(focus = false) {
  error.hidden = true;
  form.hidden = state.completed;
  document.getElementById('completion').hidden = !state.completed;
  const percent = state.completed ? 100 : Math.round(state.step / stages.length * 100);
  document.getElementById('step-counter').textContent = state.completed ? 'RESPOSTAS SALVAS' : `ETAPA ${state.step + 1} DE ${stages.length}`;
  document.getElementById('progress-label').textContent = `${percent}% concluído`;
  document.getElementById('progress-fill').style.width = `${percent}%`;
  document.querySelector('.progress-track').setAttribute('aria-valuenow', percent);
  document.querySelectorAll('.step-nav li').forEach((item, index) => {
    item.classList.toggle('active', !state.completed && index === state.step);
    item.classList.toggle('done', state.completed || index < state.step);
    if (!state.completed && index === state.step) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
    item.querySelector('span').textContent = state.completed || index < state.step ? '✓' : index + 1;
  });
  if (state.completed) { if (focus) document.getElementById('completion').focus({ preventScroll: true }); return; }
  const stage = stages[state.step];
  const title = el('h3', 'step-title', stage.title); title.tabIndex = -1;
  content.replaceChildren(title, el('p', 'step-description', stage.description), ...stage.fields.map(createField));
  document.getElementById('back').disabled = state.step === 0;
  document.getElementById('next').textContent = state.step === stages.length - 1 ? 'Salvar respostas' : 'Continuar';
  status.textContent = storageAvailable ? (state.updatedAt ? 'Respostas salvas neste navegador' : 'Seu progresso fica salvo aqui') : 'Armazenamento indisponível';
  if (focus) { document.querySelector('.planner-card').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); title.focus({ preventScroll: true }); }
}

form.addEventListener('input', event => {
  const field = fields.find(item => item.key === event.target.name);
  if (!field) return;
  if (field.type === 'tel') {
    const input = event.target;
    const digitsBeforeCaret = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, '').length;
    const digits = input.value.replace(/\D/g, '').slice(0, 11);
    const local = digits.slice(2);
    let formatted = digits.length === 1 ? `(${digits}` : digits.length === 2 ? `(${digits})` : digits;
    if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${local.length <= 4 ? local : digits.length <= 10 ? `${local.slice(0, 4)}-${local.slice(4)}` : `${local.slice(0, 5)}-${local.slice(5)}`}`;
    input.value = formatted;
    let caret = 0, count = 0;
    while (caret < formatted.length && count < digitsBeforeCaret) { if (/\d/.test(formatted[caret])) count++; caret++; }
    while (caret < formatted.length && !/\d/.test(formatted[caret])) caret++;
    input.setSelectionRange(caret, caret);
  }
  state.answers[field.key] = event.target.value;
  if (field.key === 'execution') {
    const when = fields.find(item => item.key === 'when');
    const container = content.querySelector('[data-field="when"]');
    if (container) container.hidden = !isVisible(when);
    if (!isVisible(when)) {
      delete state.answers.when;
      content.querySelectorAll('[name="when"]').forEach(input => { input.checked = false; });
    }
  }
  if (field.key === 'value') content.querySelectorAll('[name="valueType"]').forEach(input => { input.required = requiredField(fields.find(item => item.key === 'valueType')); });
  state.completed = false;
  event.target.removeAttribute('aria-invalid');
  error.hidden = true;
  persist();
});
form.addEventListener('change', event => {
  if (event.target.name) { state.answers[event.target.name] = event.target.value; persist(); }
});
form.addEventListener('submit', event => {
  event.preventDefault();
  for (const field of stages[state.step].fields.filter(isVisible)) {
    const input = form.elements.namedItem(field.key);
    const value = input.value;
    state.answers[field.key] = value;
    if (!validAnswer(field, value) || (input.validity && !input.validity.valid)) {
      error.textContent = field.type === 'number' ? 'Confira o valor informado. Use um número positivo dentro do limite do campo.' : 'Responda às perguntas desta etapa para continuar.';
      error.hidden = false;
      const target = input instanceof RadioNodeList ? input[0] : input;
      target.setAttribute('aria-invalid', 'true'); target.focus(); persist(); return;
    }
  }
  const previousStep = state.step;
  const budgetRanges = { 'Até R$ 5 mil': [0, 5000], 'R$ 5–15 mil': [5000, 15000], 'R$ 15–30 mil': [15000, 30000], 'R$ 30–60 mil': [30000, 60000], 'Acima de R$ 60 mil': [60000, Infinity] };
  for (const key of ['currentBudget', 'nextBudget']) {
    const exact = state.answers[`${key}Exact`];
    const range = budgetRanges[state.answers[key]];
    if (stages[state.step].fields.some(field => field.key === key) && exact !== undefined && exact !== '' && range && (Number(exact) < range[0] || Number(exact) > range[1])) {
      error.textContent = 'O valor exato de orçamento deve estar dentro da faixa selecionada. Ajuste a faixa ou o valor.';
      error.hidden = false;
      document.getElementById(`${key}Exact`).focus(); persist(); return;
    }
  }
  if (state.step < stages.length - 1) state.step += 1;
  else state.completed = true;
  if (!persist()) {
    state.completed = false;
    state.step = previousStep;
    error.textContent = 'O navegador bloqueou o armazenamento. Permita os dados deste site para salvar suas respostas e continuar.';
    error.hidden = false; return;
  }
  render(true);
});
document.getElementById('back').addEventListener('click', () => { state.step = Math.max(0, state.step - 1); persist(); render(true); });
document.getElementById('review').addEventListener('click', () => { state.completed = false; state.step = 0; persist(); render(true); });
render();
