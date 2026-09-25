/*
 * Motor das avaliações de múltipla escolha.
 * Cada página define window.QUIZ = { questions: [{ q, opts: [...], a: índice correto, exp }] }
 * e contém #quiz, #submit, #reset, #result e #gabarito.
 */
(function () {
  var LETTERS = ['a', 'b', 'c', 'd', 'e'];
  var data = window.QUIZ;
  var root = document.getElementById('quiz');
  var result = document.getElementById('result');
  var gabarito = document.getElementById('gabarito');

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  data.questions.forEach(function (item, qi) {
    var box = el('div', 'q');
    box.setAttribute('role', 'radiogroup');
    box.setAttribute('aria-labelledby', 'enun' + qi);
    var enun = el('p', 'enun', '<span class="num">' + (qi + 1) + '.</span>' + item.q);
    enun.id = 'enun' + qi;
    box.appendChild(enun);
    item.opts.forEach(function (opt, oi) {
      var label = el('label');
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'q' + qi;
      input.value = oi;
      label.appendChild(input);
      label.appendChild(el('span', null, '<b>' + LETTERS[oi] + ')</b> ' + opt));
      box.appendChild(label);
    });
    box.appendChild(el('div', 'feedback'));
    root.appendChild(box);
  });

  // Gabarito para impressão (professor/tutor)
  var list = el('ol');
  data.questions.forEach(function (item) {
    list.appendChild(el('li', null, '<b>' + LETTERS[item.a] + ')</b> ' + item.exp));
  });
  gabarito.appendChild(list);

  document.getElementById('submit').onclick = function () {
    var boxes = root.querySelectorAll('.q');
    var unanswered = [];
    boxes.forEach(function (box, qi) {
      if (!box.querySelector('input:checked')) unanswered.push(qi + 1);
    });
    if (unanswered.length && !confirm('Questões sem resposta: ' + unanswered.join(', ') + '. Deseja enviar mesmo assim?')) return;

    var hits = 0;
    boxes.forEach(function (box, qi) {
      var item = data.questions[qi];
      var checked = box.querySelector('input:checked');
      var chosen = checked ? Number(checked.value) : -1;
      var labels = box.querySelectorAll('label');
      labels.forEach(function (l, oi) {
        l.classList.remove('correct', 'wrong');
        if (oi === item.a) l.classList.add('correct');
        else if (oi === chosen) l.classList.add('wrong');
      });
      box.querySelectorAll('input').forEach(function (inp) { inp.disabled = true; });
      var ok = chosen === item.a;
      if (ok) hits++;
      box.querySelector('.feedback').innerHTML =
        (ok ? '<b class="ok">Correta.</b> ' : '<b class="bad">Incorreta.</b> Resposta: <b>' + LETTERS[item.a] + ')</b>. ') + item.exp;
      box.classList.add('answered');
    });

    var total = data.questions.length;
    var nota = (hits / total * 10).toFixed(1).replace('.', ',');
    result.querySelector('.score').textContent = 'Nota ' + nota;
    result.querySelector('.detail').textContent = hits + ' de ' + total + ' questões corretas.';
    result.classList.add('show');
    document.getElementById('submit').disabled = true;
    result.scrollIntoView({ behavior: 'smooth' });
  };

  document.getElementById('reset').onclick = function () {
    root.querySelectorAll('.q').forEach(function (box) {
      box.classList.remove('answered');
      box.querySelectorAll('label').forEach(function (l) { l.classList.remove('correct', 'wrong'); });
      box.querySelectorAll('input').forEach(function (inp) { inp.disabled = false; inp.checked = false; });
    });
    result.classList.remove('show');
    document.getElementById('submit').disabled = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  document.getElementById('print-test').onclick = function () {
    gabarito.classList.remove('print');
    window.print();
  };
  document.getElementById('print-key').onclick = function () {
    gabarito.classList.add('print');
    window.print();
    gabarito.classList.remove('print');
  };
})();
