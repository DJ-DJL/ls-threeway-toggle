class Option {
  constructor(optionElement) {
    this.optionElement = optionElement;
    this.rdo = document.createElement('input');
    this.lbl = document.createElement('label');
    this.updateFromOption();
  }
  set value(value) {
    this.rdo.setAttribute('value', value);
    this.rdo.value = value;
  }
  set text(text) {
    this.lbl.innerText = text;
    this.lbl.setAttribute('data-boldSize', text);
  }
  get value() { return this.rdo.value; }
  get text() { return this.lbl.innerText; }
  updateFromOption() {
    if (this.optionElement) {
      this.text = this.optionElement.innerText;
      this.value = this.optionElement.getAttribute('value') || this.optionElement.innerText;
    } else {
      this.text = 'Missing Option child element';
      this.value = null;
    }
  }
}

const svgUp = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-33 -5 116 109" width="32" version="2">
  <!-- 0,30  50,30  25,73.3 -->
  <path d="M 0,100 
           l 50,0 
           a 30 30 0 0 0 26 -45 
           l -25,-43.3
           a 30 30 120 0 0 -52 0 
           l -25,43.3
           A 30 30 240 0 0 0 100"/>
  <circle r="20"/>
</svg>
`;
const svgDown = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-33 -3 116 109" width="32" version="2">
      <!-- 0,30  50,30  25,73.3 -->
      <path d="M 0,0 
               l 50,0 
               a 30 30 0 0 1 26 45 
               l -25,43.3
               a 30 30 120 0 1 -52 0 
               l -25,-43.3
               A 30 30 240 0 1 0 0" />
      <circle r="20"/>
    </svg>
`;

customElements.define('three-way-toggle',
  class extends HTMLElement {
    #value;
    #sessionStorageID = `three-way-${this.id}`;
    #setValue(value) {
      const prevValue = this.#value;
      this.#value = value;
      this.#pauseMutationObserver();
      try {
        this.setAttribute('value', value);
        for (const option of this.#options) {
          if (option.option) {
            option.option.checked = (option.value === value);
          }
        }
      } finally {
        this.#resumeMutationObserver();
      }
      sessionStorage.setItem(this.#sessionStorageID, value);
      // add event stuff here
      if (prevValue != this.#value) {
        this.dispatchEvent(new Event('change'));
      }
    }
    get value() {
      return this.#value;
    }
    set value(value) {
      const rdos = this.#options.map(o => o.rdo);
      const rdo = rdos.find(rdo => rdo.value === value);
      if (rdo) {
        rdo.checked = true;
      }
      this.#setValue(value);
    }
    #lbl3b
    #options
    #mutationObserver
    #resumeMutationObserver() {
      if (this.#mutationObserver) {
        this.#mutationObserver.observe(this, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
    }
    #pauseMutationObserver() {
      if (this.#mutationObserver) {
        this.#mutationObserver.disconnect();
      }
    }
    constructor() {
      super();
      this.#options = [...this.querySelectorAll('option')].map(option => new Option(option));
      if (this.#options.length !== 3) {
        console.warn('Insufficient option children to fully construct now. Doing the best I can')
        // throw new Error('three-way-toggle elements require exactly 3 option children');
        while (this.#options.length !== 3) {
          this.#options.push(new Option());
        }
      }
      const shadowRoot = this.attachShadow({ mode: 'open' });

      this.#lbl3b = document.createElement('label');
      this.#lbl3b.innerText = this.#options[2].text;

      setAttributes(this.#options[0].rdo, { id: 'A', name: 'choice', 'type': 'radio' });
      setAttributes(this.#options[1].rdo, { id: 'B', name: 'choice', 'type': 'radio' });
      setAttributes(this.#options[2].rdo, { id: 'C', name: 'choice', 'type': 'radio' });
      this.#options[0].lbl.classList.add('A');
      this.#options[1].lbl.classList.add('B');
      this.#options[2].lbl.classList.add('C');
      this.#lbl3b.classList.add('min-size');
      setAttributes(this.#options[0].lbl, { for: 'A' });
      setAttributes(this.#options[1].lbl, { for: 'B' });
      setAttributes(this.#options[2].lbl, { for: 'C' });

      this.#options[0].rdo.addEventListener('change', () => this.#setValue(this.#options[0].rdo.value));
      this.#options[1].rdo.addEventListener('change', () => this.#setValue(this.#options[1].rdo.value));
      this.#options[2].rdo.addEventListener('change', () => this.#setValue(this.#options[2].rdo.value));

      const svg = getSVG(this.getAttribute('direction') || 'down');
      svg.querySelector('circle').style.transitionDuration = '0s';
      const styles = getStyles(this.getAttribute('direction') || 'down');
      this.value = sessionStorage.getItem(this.#sessionStorageID) || this.#options[0].rdo.value;

      const divArrangement = document.createElement('div');
      divArrangement.append(svg, this.#options[2].lbl);
      this.setAttribute('data-boldsize', this.#options[2].text);
      this.shadowRoot.append(styles, ...this.#options.map(o => o.rdo), this.#options[0].lbl, divArrangement, this.#options[1].lbl, this.#lbl3b);
      if (Object.prototype.hasOwnProperty.call(this, 'value')) {
        const value = this.value;
        delete this.value;
        this.value = value;
      }
      setTimeout(() => {
        svg.querySelector('circle').style.transitionDuration = null;
        const minTotalWidth = this.#lbl3b.clientWidth;
        const divWidthOn2 = divArrangement.clientWidth / 2;
        this.#options[0].lbl.style.marginLeft = ` ${Math.max(0, (minTotalWidth / 2) - (this.#options[0].lbl.clientWidth + divWidthOn2))}px`;
        this.#options[1].lbl.style.marginRight = `${Math.max(0, (minTotalWidth / 2) - (this.#options[1].lbl.clientWidth + divWidthOn2))}px`;
        this.#lbl3b.style.display = 'none';
      }, 1);

      this.#mutationObserver = new MutationObserver((...args) => this.#mutation(...args));
      this.#resumeMutationObserver();
    }
    #mutation(mutationList, observer) {
      const currentValue = this.value;
      for (const [idx, optionElement] of Object.entries(this.querySelectorAll('option'))) {
        this.#options[idx].optionElement = optionElement;
        this.#options[idx].updateFromOption();
        // this.#setOption(this.#options[idx]);
      }
      this.value = currentValue;
    }
  }
);


function setAttributes(element, attributes) {
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}
function getSVG(direction) {
  const doc = document.implementation.createHTMLDocument();
  if (direction === 'up') {
    doc.write(svgUp);
  } else {
    doc.write(svgDown);
  }
  return doc.querySelector('svg');
}
function getStyles(direction) {
  const style = document.createElement('link');
  style.setAttribute('rel', 'stylesheet');
  style.setAttribute('href', '/3way-toggle.css');
  return style;
}
