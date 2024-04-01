import { LitElement, html } from 'lit';
import { asyncReplace } from 'lit/directives/async-replace.js';
import { store } from './Store.ts';

const count = store.count;
const name = store.name;

export class MyCounter extends LitElement {
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  render() {
    return html`
      <p>Hello: ${name.value}</p>
      <p>Initial value: ${count.value}</p>
      <p>Current value: ${asyncReplace(count)}</p>
      <button @click=${() => count.value++}>${asyncReplace(count)}</button>
    `;
  }
}

customElements.define('my-counter', MyCounter);
