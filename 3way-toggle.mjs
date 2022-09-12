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
      this.#value = value;
      this.setAttribute('value', value);
      for (const option of this.#options) {
        option.option.checked = (option.value === value);
      }
      sessionStorage.setItem(this.#sessionStorageID, value);
      // add event stuff here
      this.dispatchEvent(new Event('change'));
    }
    get value() {
      return this.#value;
    }
    set value(value) {
      console.log('set value', value, [this.#rdo1, this.#rdo2, this.#rdo3].find(rdo => rdo.value === value))
      const rdo = [this.#rdo1, this.#rdo2, this.#rdo3].find(rdo => rdo.value === value);
      if (rdo) {
        rdo.checked = true;
      }
      this.#setValue(value);
    }
    #rdo1
    #rdo2
    #rdo3
    #lbl1
    #lbl2
    #lbl3
    #lbl3b
    #options

    #setOption(rdo, lbl, option) {
      if (rdo) {
        rdo.setAttribute('value', option.value);
      }
      if (lbl) {
        lbl.setAttribute(`data-boldsize`, option.text)
        lbl.innerText = option.text;
      }
    }
    constructor() {
      super();
      this.#options = [...this.querySelectorAll('option')].map(option => ({
        option,
        text: option.innerText,
        value: option.getAttribute('value') || option.innerText,
      }));
      if (this.#options.length !== 3) {
        throw new Error('three-way-toggle elements require exactly 3 option children');
      }
      const shadowRoot = this.attachShadow({ mode: 'open' });
      this.#rdo1 = document.createElement('input');
      this.#rdo2 = document.createElement('input');
      this.#rdo3 = document.createElement('input');
      this.#lbl1 = document.createElement('label');
      this.#lbl2 = document.createElement('label');
      this.#lbl3 = document.createElement('label');
      this.#lbl3b = document.createElement('label');
      this.#setOption(this.#rdo1, this.#lbl1, this.#options[0]);
      this.#setOption(this.#rdo2, this.#lbl2, this.#options[1]);
      this.#setOption(this.#rdo3, this.#lbl3, this.#options[2]);
      this.#setOption(null, this.#lbl3b, this.#options[2]);

      setAttributes(this.#rdo1, { id: 'A', name: 'choice', 'type': 'radio' });
      setAttributes(this.#rdo2, { id: 'B', name: 'choice', 'type': 'radio' });
      setAttributes(this.#rdo3, { id: 'C', name: 'choice', 'type': 'radio' });
      this.#lbl1.classList.add('A');
      this.#lbl2.classList.add('B');
      this.#lbl3.classList.add('C');
      this.#lbl3b.classList.add('min-size');
      setAttributes(this.#lbl1, { for: 'A' });
      setAttributes(this.#lbl2, { for: 'B' });
      setAttributes(this.#lbl3, { for: 'C' });

      this.#rdo1.addEventListener('change', () => this.#setValue(this.#rdo1.value));
      this.#rdo2.addEventListener('change', () => this.#setValue(this.#rdo2.value));
      this.#rdo3.addEventListener('change', () => this.#setValue(this.#rdo3.value));

      const svg = getSVG(this.getAttribute('direction') || 'down');
      svg.querySelector('circle').style.transitionDuration = '0s';
      const styles = getStyles(this.getAttribute('direction') || 'down');
      this.value = sessionStorage.getItem(this.#sessionStorageID) || this.#rdo1.value;

      const divArrangement = document.createElement('div');
      divArrangement.append(svg, this.#lbl3);
      this.setAttribute('data-boldsize', this.#options[2].text);
      this.shadowRoot.append(styles, this.#rdo1, this.#rdo2, this.#rdo3, this.#lbl1, divArrangement, this.#lbl2, this.#lbl3b);
      if (Object.prototype.hasOwnProperty.call(this, 'value')) {
        const value = this.value;
        delete this.value;
        this.value = value;
      }
      setTimeout(() => {
        svg.querySelector('circle').style.transitionDuration = null;
        const minTotalWidth = this.#lbl3b.clientWidth;
        console.log(minTotalWidth);
        const divWidthOn2 = divArrangement.clientWidth / 2;
        this.#lbl1.style.marginLeft = ` ${Math.max(0, (minTotalWidth / 2) - (this.#lbl1.clientWidth + divWidthOn2))}px`;
        this.#lbl2.style.marginRight = `${Math.max(0, (minTotalWidth / 2) - (this.#lbl2.clientWidth + divWidthOn2))}px`;
        this.#lbl3b.style.display = 'none';
      }, 1);


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
