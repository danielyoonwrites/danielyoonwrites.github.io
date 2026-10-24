// Fewer spam calls: shows one screen at a time.
// First three questions, then only the steps that match the answers, then "You're all set."
// Nothing is saved or sent anywhere. The answers are forgotten when the page closes.

(function () {
  var answers = {};   // for example { phone: 'iphone', carrier: 'verizon', state: 'california' }
  var history = [];   // screens visited, so Back can go to the one before
  var steps = [];     // the steps that match the answers, in order
  var stepIndex = 0;  // which of those steps is showing

  var screens = Array.prototype.slice.call(document.querySelectorAll('[data-screen]'));
  var allSteps = Array.prototype.slice.call(document.querySelectorAll('[data-step]'));
  var stepButtons = document.querySelector('.step-buttons');
  var questionOrder = ['question-phone', 'question-carrier', 'question-state'];

  // Shows one screen, hides the rest, and moves the reader to its heading
  function show(screen, remember) {
    if (remember !== false) {
      var current = document.querySelector('[data-screen].active');
      if (current) history.push(current);
    }
    screens.forEach(function (s) { s.classList.remove('active'); });
    screen.classList.add('active');
    stepButtons.classList.toggle('active', screen.hasAttribute('data-step'));
    // Hide the intro once the questions are done
    document.body.classList.toggle('answered', screen.hasAttribute('data-step') || screen.id === 'finished');
    window.scrollTo(0, 0);
    var heading = screen.querySelector('h2');
    if (heading) heading.focus({ preventScroll: true });
  }

  // Does this step match the answers? Steps with no data-phone, data-carrier
  // or data-state are for everyone.
  function matches(step) {
    var phone = step.getAttribute('data-phone');
    var carrier = step.getAttribute('data-carrier');
    var state = step.getAttribute('data-state');
    if (phone && phone !== answers.phone) return false;
    if (carrier && carrier !== answers.carrier) return false;
    if (state && state !== answers.state) return false;
    return true;
  }

  function showStep(index) {
    stepIndex = index;
    var step = steps[index];
    step.querySelector('.progress').textContent = 'Step ' + (index + 1) + ' of ' + steps.length;
    show(step);
  }

  // Answer buttons
  document.querySelectorAll('[data-question]').forEach(function (button) {
    button.addEventListener('click', function () {
      answers[button.getAttribute('data-question')] = button.getAttribute('data-answer');
      var screen = button.closest('[data-screen]');
      var next = questionOrder.indexOf(screen.id) + 1;
      if (next < questionOrder.length) {
        show(document.getElementById(questionOrder[next]));
      } else {
        steps = allSteps.filter(matches);
        showStep(0);
      }
    });
  });

  // "Done, next step"
  document.querySelector('[data-next]').addEventListener('click', function () {
    if (stepIndex + 1 < steps.length) {
      showStep(stepIndex + 1);
    } else {
      show(document.getElementById('finished'));
    }
  });

  // Back buttons: go to the screen before this one
  document.querySelectorAll('[data-back]').forEach(function (button) {
    button.addEventListener('click', function () {
      var previous = history.pop();
      if (!previous) return;
      if (previous.hasAttribute('data-step')) stepIndex = steps.indexOf(previous);
      show(previous, false);
    });
  });

  // "Start over"
  document.querySelector('[data-restart]').addEventListener('click', function () {
    answers = {};
    history = [];
    show(document.getElementById('question-phone'), false);
  });

  // Start with the first question
  show(document.getElementById('question-phone'), false);
})();
