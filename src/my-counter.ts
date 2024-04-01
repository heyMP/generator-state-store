import { LitElement, PropertyValueMap, html } from 'lit';
import { asyncReplace } from 'lit/directives/async-replace.js';
import { asyncAppend } from 'lit/directives/async-append.js';
import { store } from './Store.ts';

const count = store.count;
// const name = store.name;

export class MyCounter extends LitElement {
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected async firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    for await (const _ of count.stream()) {
      this.requestUpdate();
    }
  }

  render() {
    return html`
      <p>Initial value: ${count.value}</p>
      <button @click=${() => count.value++}>${count.value}</button>
    `;
  }
}

customElements.define('my-counter', MyCounter);
