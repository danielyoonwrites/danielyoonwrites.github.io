// Tabs: show one part of a page at a time, so readers don't have to scroll far.
// Used on writing.html.
//
// How a page sets up tabs:
//   <div class="tabs">
//     <div class="tab-list" role="tablist" aria-label="What the tabs are">
//       <button type="button" role="tab" id="tab-one" aria-controls="one">First</button>
//       <button type="button" role="tab" id="tab-two" aria-controls="two">Second</button>
//     </div>
//     <div class="tab-panel" id="one" role="tabpanel" aria-labelledby="tab-one"> ... </div>
//     <div class="tab-panel" id="two" role="tabpanel" aria-labelledby="tab-two"> ... </div>
//   </div>
//
// If JavaScript doesn't run, the tab buttons stay hidden and every part shows, one after another.

document.querySelectorAll('.tabs').forEach((tabs) => {
  const buttons = [...tabs.querySelectorAll('[role="tab"]')];
  const panels = buttons.map((button) => document.getElementById(button.getAttribute('aria-controls')));

  // Shows one part and hides the others
  function show(index) {
    buttons.forEach((button, i) => {
      const selected = i === index;
      button.setAttribute('aria-selected', selected);
      button.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
  }

  buttons.forEach((button, i) => {
    button.addEventListener('click', () => show(i));

    // The left and right arrow keys move between tabs, for people using a keyboard
    button.addEventListener('keydown', (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      const next = (i + step + buttons.length) % buttons.length;
      show(next);
      buttons[next].focus();
    });
  });

  // A link to one part, like writing.html#latest, opens that tab
  function showFromAddress() {
    const index = panels.findIndex((panel) => '#' + panel.id === location.hash);
    if (index < 0) return false;
    show(index);
    tabs.scrollIntoView({ block: 'start' });
    return true;
  }
  window.addEventListener('hashchange', showFromAddress);

  if (!showFromAddress()) show(0);
  tabs.classList.add('tabs-ready'); // shows the tab buttons (see style.css)
});
