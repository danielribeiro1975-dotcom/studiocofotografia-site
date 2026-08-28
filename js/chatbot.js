/* ==========================================================================
   AQ Studio & Co. | Fotografia de Família — Chatbot de qualificação de leads
   100% client-side: ao final, os dados coletados são enviados para o
   WhatsApp da equipe (não há backend/armazenamento neste site ainda).
   ========================================================================== */
(function(){

  var WA_PHONE = '5541996221890';

  var lead = {};
  var stepIndex = 0;
  var started = false;

  var steps = [
    {
      bot: "Olá! Que bom ter você por aqui. 💛 Vamos descobrir qual experiência combina melhor com a sua família?",
      type: 'options',
      options: [{ label: "Vamos lá 🙏", value: "sim" }]
    },
    {
      bot: "Qual experiência você está procurando?",
      type: 'options',
      key: 'experiencia',
      options: ["Família", "Gestante", "Newborn", "Nascimento", "Acompanhamento", "Kids", "Smash the Cake", "Aniversário", "Ensaio Temático"]
    },
    {
      bot: "Qual o seu nome?",
      type: 'text',
      key: 'nome',
      placeholder: 'Digite seu nome'
    },
    {
      bot: function(l){ return 'Prazer, ' + l.nome + '! Em qual e-mail podemos te enviar mais informações?'; },
      type: 'text',
      key: 'email',
      inputType: 'email',
      placeholder: 'seu@email.com'
    },
    {
      bot: "Poderia me informar o número do seu celular?",
      type: 'text',
      key: 'celular',
      inputType: 'tel',
      placeholder: '(DDD) 00000-0000'
    },
    {
      bot: "Para quando você está pensando no ensaio?",
      type: 'text',
      key: 'data',
      placeholder: 'Ex: 15/09/2026 ou "ainda não defini"'
    },
    {
      bot: "Qual a idade do bebê ou da criança? (se não for o caso, pode pular)",
      type: 'text',
      key: 'idade',
      placeholder: 'Ex: 8 meses, 3 anos, ainda na barriga...'
    },
    {
      bot: "Em qual cidade você está?",
      type: 'options',
      key: 'cidade',
      options: ["Curitiba", "São José dos Pinhais", "Pinhais", "Colombo", "Campo Largo", "Araucária", "Outra cidade"]
    },
    {
      bot: function(l){ return 'Perfeito, ' + l.nome + '! Gostaria de contar um pouco sobre o que imaginou para esse ensaio?'; },
      type: 'text',
      key: 'detalhes',
      placeholder: 'Conte pra gente (opcional)'
    },
    {
      bot: function(l){ return 'Perfeito! Já conseguimos entender melhor o que você está procurando, ' + l.nome + '. Vamos encaminhar sua conversa para nossa equipe continuar o atendimento com você.'; },
      type: 'final'
    }
  ];

  var panel, body, inputRow, textInput, sendBtn, launcher;

  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  }

  function scrollBottom(){
    body.scrollTop = body.scrollHeight;
  }

  function pushBubble(text, sender){
    var m = el('div', 'msg ' + sender, text);
    body.appendChild(m);
    scrollBottom();
  }

  function showTyping(cb){
    var t = el('div', 'typing', '<span></span><span></span><span></span>');
    body.appendChild(t);
    scrollBottom();
    setTimeout(function(){
      t.remove();
      cb();
    }, 550 + Math.random() * 350);
  }

  function clearOptionsRow(){
    var existing = body.querySelectorAll('.chat-options');
    existing.forEach(function(o){ o.remove(); });
  }

  function waLink(message){
    return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(message);
  }

  function buildSummary(intent){
    var lines = [
      'Olá! Vim do site da AQ Studio & Co. | Fotografia de Família e gostaria de conversar sobre um ensaio.',
      '',
      'Experiência de interesse: ' + (lead.experiencia || '-'),
      'Nome: ' + (lead.nome || '-'),
      'E-mail: ' + (lead.email || '-'),
      'Celular: ' + (lead.celular || '-'),
      'Data desejada: ' + (lead.data || '-'),
      'Idade do bebê/criança: ' + (lead.idade || '-'),
      'Cidade: ' + (lead.cidade || '-'),
      'Detalhes: ' + (lead.detalhes || '-')
    ];
    if(intent === 'agendar'){
      lines.push('', 'Gostaria de agendar uma conversa para alinharmos os detalhes!');
    }
    return lines.join('\n');
  }

  function renderStep(){
    if(stepIndex >= steps.length) return;
    var step = steps[stepIndex];
    var botText = typeof step.bot === 'function' ? step.bot(lead) : step.bot;

    inputRow.classList.add('hidden');
    clearOptionsRow();

    showTyping(function(){
      pushBubble(botText, 'bot');

      if(step.type === 'options'){
        var wrap = el('div', 'chat-options');
        step.options.forEach(function(opt){
          var label = typeof opt === 'string' ? opt : opt.label;
          var btn = el('button', 'chat-opt', label);
          btn.type = 'button';
          btn.addEventListener('click', function(){
            answerOption(step, label);
          });
          wrap.appendChild(btn);
        });
        body.appendChild(wrap);
        scrollBottom();
      } else if(step.type === 'text'){
        inputRow.classList.remove('hidden');
        textInput.value = '';
        textInput.type = step.inputType || 'text';
        textInput.placeholder = step.placeholder || '';
        textInput.focus();
      } else if(step.type === 'final'){
        document.dispatchEvent(new CustomEvent('aq:lead_complete', { detail: lead }));
        var wrap = el('div', 'chat-options');
        var b1 = el('a', 'chat-opt final-link', '💬 Falar com um humano agora');
        b1.href = waLink(buildSummary('humano'));
        b1.target = '_blank'; b1.rel = 'noopener';
        var b2 = el('a', 'chat-opt final-link', '📅 Agendar uma conversa');
        b2.href = waLink(buildSummary('agendar'));
        b2.target = '_blank'; b2.rel = 'noopener';
        wrap.appendChild(b1);
        wrap.appendChild(b2);
        body.appendChild(wrap);
        scrollBottom();
      }
    });
  }

  function answerOption(step, label){
    clearOptionsRow();
    pushBubble(label, 'user');
    if(step.key) lead[step.key] = label;
    stepIndex++;
    setTimeout(renderStep, 250);
  }

  function submitText(){
    var step = steps[stepIndex];
    var val = textInput.value.trim();
    if(!val) { textInput.focus(); return; }
    pushBubble(val, 'user');
    if(step.key) lead[step.key] = val;
    inputRow.classList.add('hidden');
    stepIndex++;
    setTimeout(renderStep, 250);
  }

  function openPanel(){
    panel.classList.add('open');
    if(!started){
      started = true;
      renderStep();
    }
  }
  function closePanel(){ panel.classList.remove('open'); }

  function init(){
    launcher = document.getElementById('chatLauncher');
    panel = document.getElementById('chatPanel');
    body = document.getElementById('chatBody');
    inputRow = document.getElementById('chatInputRow');
    textInput = document.getElementById('chatTextInput');
    sendBtn = document.getElementById('chatSendBtn');
    var closeBtn = document.getElementById('chatCloseBtn');

    if(!panel) return;

    launcher.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    sendBtn.addEventListener('click', submitText);
    textInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); submitText(); }
    });

    // Permite abrir o chat a partir de qualquer botão com data-open-chat
    document.querySelectorAll('[data-open-chat]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        openPanel();
      });
    });

    window.openAQChat = openPanel;
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
