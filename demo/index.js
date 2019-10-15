import { html } from 'lit-html';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/arc-data-export/arc-data-export.js';
import '@advanced-rest-client/arc-models/client-certificate-model.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '../client-certificates-panel.js';

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'listType',
      'exportSheetOpened',
      'exportFile',
      'exportData'
    ]);
    this._componentName = 'client-certificates-panel';
    this.demoStates = ['Filles', 'Outlined', 'Anypoint'];
    this.listType = 'default';

    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._exportOpenedChanged = this._exportOpenedChanged.bind(this);
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);

    window.addEventListener('file-data-save', this._fileExportHandler.bind(this));
    window.addEventListener('google-drive-data-save', this._fileExportHandler.bind(this));
    window.addEventListener('encryption-decode', this._decodeHandler.bind(this));
    window.addEventListener('encryption-encode', this._encodeHandler.bind(this));
  }

  async generateData() {
    await DataGenerator.insertCertificatesData();
    const e = new CustomEvent('data-imported', {
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  async deleteData() {
    const e = new CustomEvent('destroy-model', {
      detail: {
        models: ['client-certificates']
      },
      bubbles: true
    });
    document.body.dispatchEvent(e);
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  _listTypeHandler(e) {
    const { name, checked } = e.target;
    if (!checked) {
      return;
    }
    this.listType = name;
  }

  _fileExportHandler(e) {
    const { content, file } = e.detail;
    setTimeout(() => {
      try {
        this.exportData = JSON.stringify(JSON.parse(content), null, 2);
      } catch (_) {
        this.exportData = content;
      }
      this.exportFile = file;
      this.exportSheetOpened = true;
    });
    e.preventDefault();
  }

  _exportOpenedChanged(e) {
    this.exportSheetOpened = e.detail.value;
  }

  _decodeHandler(e) {
    const { method } = e.detail;
    e.preventDefault();
    e.detail.result = this.decode(method, e.detail);
  }

  _encodeHandler(e) {
    const { method } = e.detail;
    e.preventDefault();
    e.detail.result = this.encode(method, e.detail);
  }

  async encode(method, opts) {
    switch (method) {
      case 'aes': return await this.encodeAes(opts.data, opts.passphrase);
      default: throw new Error(`Unknown encryption method`);
    }
  }

  async encodeAes(data, passphrase) {
    // see https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
    const pwUtf8 = new TextEncoder().encode(passphrase);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const alg = { name: 'AES-GCM', iv };
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);
    const ptUint8 = new TextEncoder().encode(data);
    const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);
    const ctArray = Array.from(new Uint8Array(ctBuffer));
    const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
    const ctBase64 = btoa(ctStr);
    const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return ivHex+ctBase64;
  }

  async decode(method, opts) {
    switch (method) {
      case 'aes': return await this.decodeAes(opts.data, opts.passphrase);
      default: throw new Error(`Unknown decryption method`);
    }
  }

  async decodeAes(ciphertext, passphrase) {
    if (passphrase === undefined) {
      passphrase = prompt('File password');
      if (passphrase === null) {
        throw new Error('Password is required to open the file.');
      }
    }
    try {
      const pwUtf8 = new TextEncoder().encode(passphrase);
      const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
      const iv = ciphertext.slice(0,24).match(/.{2}/g).map(byte => parseInt(byte, 16));
      const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) };
      const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
      const ctStr = atob(ciphertext.slice(24));
      const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));
      const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);
      const plaintext = new TextDecoder().decode(plainBuffer);
      return plaintext;
    } catch (_) {
      throw new Error('Invalid password.');
    }
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      listType,
      exportSheetOpened,
      exportData,
      exportFile
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the certificates panel element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <client-certificates-panel
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            .listType="${listType}"
            slot="content"></client-certificates-panel>

          <label slot="options" id="listTypeLabel">List type</label>
          <anypoint-radio-group
            slot="options"
            selectable="anypoint-radio-button"
            aria-labelledby="listTypeLabel"
          >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              checked
              name="default"
              >Default</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              name="comfortable"
              >Comfortable</anypoint-radio-button
            >
            <anypoint-radio-button
              @change="${this._listTypeHandler}"
              name="compact"
              >Compact</anypoint-radio-button
            >
          </anypoint-radio-group>
        </arc-interactive-demo>

        <div class="data-options">
          <h3>Data options</h3>

          <anypoint-button @click="${this.generateData}">Generate data</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Clear data</anypoint-button>
        </div>

        <bottom-sheet
          .opened="${exportSheetOpened}"
          @opened-changed="${this._exportOpenedChanged}">
          <h3>Export demo</h3>
          <p>This is a preview of the file. Normally export module would save this data to file / Drive.</p>
          <p>File: ${exportFile}</p>
          <pre>${exportData}</pre>
        </bottom-sheet>

        <arc-data-export appversion="demo-page"></arc-data-export>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Client certificates screen</h2>
      <client-certificate-model></client-certificate-model>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
