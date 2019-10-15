[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/client-certificates-panel.svg)](https://www.npmjs.com/package/@advanced-rest-client/client-certificates-panel)

[![Build Status](https://travis-ci.org/advanced-rest-client/client-certificates-panel.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/client-certificates-panel)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/client-certificates-panel)

# client-certificates-panel

A view that render list of client certificates installed in the application,
allows to import new certificate, and delete existing.

## Usage

### Installation
```
npm install --save @advanced-rest-client/client-certificates-panel
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/client-certificates-panel/client-certificates-panel.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <client-certificates-panel></client-certificates-panel>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Data access

The element does not provide a way to access a data store as on different platform  certificates may be stored in a different way.
Because of that the element support events API that is consistent with `@advanced-rest-client/arc-models/client-certificate-model.js`.

## Development

```sh
git clone https://github.com/advanced-rest-client/client-certificates-panel
cd client-certificates-panel
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
