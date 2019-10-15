/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, css } from 'lit-element';
import { deleteIcon } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-input/anypoint-masked-input.js';
import '@anypoint-web-components/anypoint-switch/anypoint-switch.js';
/**
 * A view to import a client certificate into the application.
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
export class CertificateImport extends LitElement {
  static get styles() {
    return css`
    :host {
      display: block;
    }

    .header {
      flex-direction: row;
      display: flex;
      align-items: center;
    }

    h2 {
      font-size: var(--arc-font-headline-font-size);
      font-weight: var(--arc-font-headline-font-weight);
      letter-spacing: var(--arc-font-headline-letter-spacing);
      line-height: var(--arc-font-headline-line-height);
      flex: 1;
    }

    .type-options {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 40px;
    }

    .cert-type-option {
      text-transform: none;
      margin: 12px 0;
      color: inherit;
      border-color: #e5e5e5;
      width: 380px;
      justify-content: start;
    }

    .cert-type-ico {
      color: var(--accent-color);
    }

    .cert-type-wrap {
      margin-left: 8px;
    }

    .cert-desc {
      font-size: 0.85rem;
    }

    .cert-file {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-top: 40px;
    }

    .icon {
      display: block;
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    .action-button {
      margin-top: 40px;
    }
    `;
  }

  static get properties() {
    return {
      /**
       * Enables outlined theme.
       */
      outlined: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * Either `pem` or `p12`.
       */
      importType: { type: String },
      /**
       * Import name
       */
      name: { type: String },
      /**
       * Trwue when the user clicked on the import button
       */
      loading: { type: Boolean },

      _page: { type: Number },

      _certificateFile: { type: Object },

      _keyFile: { type: Object },

      _certificatePassword: { type: String },

      _keyPassword: { type: String },

      _certificateHasPassword: { type: Boolean },

      _keyHasPassword: { type: Boolean },
    };
  }

  get certificateFile() {
    return this._certificateFile;
  }

  get certificatePassword() {
    return this._certificatePassword;
  }

  get keyFile() {
    return this._keyFile;
  }

  get keyPassword() {
    return this._keyPassword;
  }

  get hasKeyImport() {
    return this.importType === 'pem';
  }

  get hasKeyPasswordInput() {
    return this.importType === 'p12';
  }

  get acceptDisabled() {
    return !!this.loading || this._importInvalid;
  }

  get _importInvalid() {
    if (!this.certificateFile) {
      return true;
    }
    if (this.hasKeyImport && !this.keyFile) {
      return true;
    }
    return false;
  }

  _importTypeHandler(e) {
    const { propertyName, target } = e;
    if (propertyName !== undefined) {
      // paper-ripple dispatches `transitionend` as a custom event
      // which has no propertyName on it.
      return;
    }
    this.importType = target.dataset.type;
    this._page = 1;
  }

  cancel() {
    this.dispatchEvent(new CustomEvent('cancel'));
  }

  async accept() {
    if (this._importInvalid) {
      return;
    }
    const value = await this.getConfig();
    this.loading = true;
    this.dispatchEvent(new CustomEvent('accept', {
      detail: value
    }));
  }
  /* istanbul ignore next */
  _selectCertFileHandler() {
    const input = this.shadowRoot.querySelector('#cf');
    input.click();
  }
  /* istanbul ignore next */
  _selectKeyFileHandler() {
    const input = this.shadowRoot.querySelector('#kf');
    input.click();
  }

  _certFileHandler(e) {
    this._certificateFile = e.target.files[0];
  }

  _keyFileHandler(e) {
    this._keyFile = e.target.files[0];
  }

  _clearCertHandler() {
    this._certificateFile = null;
  }

  _clearKeyHandler() {
    this._keyFile = null;
  }

  _certPassChangeHandler(e) {
    const { checked } = e.target;
    this._certificateHasPassword = checked;
  }

  _keyPassChangeHandler(e) {
    const { checked } = e.target;
    this._keyHasPassword = checked;
  }

  _inputHandler(e) {
    const { name, value } = e.target;
    this[name] = value;
  }

  _importHandler() {
    this.accept();
  }

  async getConfig() {
    const forceBuffer = this.importType === 'p12';
    const certData = forceBuffer ?
      await this.fileToBuffer(this.certificateFile) :
      await this.fileToString(this.certificateFile);
    const cert = {
      data: certData
    };
    if (this._certificateHasPassword) {
      cert.passphrase = this.certificatePassword || '';
    }
    const result = {
      cert,
      name: this.name || '',
      type: this.importType
    };
    if (this.hasKeyImport) {
      // key can only be when `pem` and this type is always string
      const keyData = await this.fileToString(this.keyFile);
      const key = {
        data: keyData
      };
      if (this._keyHasPassword) {
        key.passphrase = this.keyPassword || '';
      }
      result.key = key;
    }
    return result;
  }

  fileToBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => { resolve(new Uint8Array(e.target.result)); };
      /* istanbul ignore next */
      reader.onerror = (e) => { reject(new Error('Unable to read file')); };
      reader.readAsArrayBuffer(blob);
    });
  }

  fileToString(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => { resolve(e.target.result); };
      /* istanbul ignore next */
      reader.onerror = (e) => { reject(new Error('Unable to read file')); };
      reader.readAsText(blob);
    });
  }

  _headerTemplate() {
    return html`<div class="header">
      <h2>Import a certificate</h2>
      <anypoint-button
        emphasis="low"
        data-action="cancel-header"
        @click="${this.cancel}"
      >Cancel</anypoint-button>
    </div>`;
  }

  _certTypeButton(type, ico, label, desc) {
    return html`<anypoint-button
      emphasis="medium"
      @transitionend="${this._importTypeHandler}"
      data-type="${type}"
      class="cert-type-option"
    >
      <div class="cert-type-ico">${ico}</div>
      <div class="cert-type-wrap">
        <div class="cert-label">${label}</div>
        <div class="cert-desc">${desc}</div>
      </div>
    </anypoint-button>`;
  }

  _startScreenTemplate() {
    return html`
    ${this._headerTemplate()}
    <p>Certificates are stored securely in internal data store.</p>
    <div class="type-options">
      ${this._certTypeButton('p12', 'P12', 'PKCS #12', 'Bundles private key with certificate')}
      ${this._certTypeButton('pem', 'PEM', 'Privacy-Enhanced Mail', 'Imports key and certificate as separate files')}
    </div>
    `;
  }

  _certificateInput() {
    return html`<anypoint-button
      emphasis="medium"
      @click="${this._selectCertFileHandler}"
    >
      Select the certificate file
    </anypoint-button>`;
  }

  _certificateInfoTemplate(file) {
    return html`
    ${file.name}
    <anypoint-icon-button @click="${this._clearCertHandler}">
      <span class="icon">${deleteIcon}</span>
    </anypoint-icon-button>
    `;
  }

  _passwordFiledTemplate(name, label) {
    return html`<anypoint-masked-input
      name="${name}"
      @value-changed="${this._inputHandler}"
    >
      <label slot="label">${label}</label>
    </anypoint-masked-input>`;
  }

  _keyInfoTemplate(file) {
    return html`
    ${file.name}
    <anypoint-icon-button @click="${this._clearKeyHandler}">
      <span class="icon">${deleteIcon}</span>
    </anypoint-icon-button>
    `;
  }

  _keyInput() {
    return html`<anypoint-button
      emphasis="medium"
      @click="${this._selectKeyFileHandler}"
    >
      Select the private key file
    </anypoint-button>`;
  }

  _certPasswordTemplate() {
    if (!this.hasKeyPasswordInput) {
      return '';
    }
    return html`<anypoint-switch
      data-type="cert"
      @change="${this._certPassChangeHandler}"
    >Certificate has password</anypoint-switch>
    ${this._certificateHasPassword ? this._passwordFiledTemplate('_certificatePassword', 'Certificate password') : ''}`;
  }

  _keyTemplate() {
    if (!this.hasKeyImport) {
      return '';
    }
    const {
      keyFile
    } = this;
    return html`<div class="cert-file" data-type="key">
    ${keyFile ? this._keyInfoTemplate(keyFile) : this._keyInput()}
    </div>
    <anypoint-switch
      data-type="key"
      @change="${this._keyPassChangeHandler}"
    >Private key has password</anypoint-switch>
    ${this._keyHasPassword ? this._passwordFiledTemplate('_keyPassword', 'Private key password') : ''}`;
  }

  _filesFormTemplate() {
    const {
      certificateFile,
      acceptDisabled,
      loading
    } = this;
    return html`
    ${this._headerTemplate()}

    <anypoint-input
      name="name"
      @value-changed="${this._inputHandler}"
    >
      <label slot="label">Certificate name<label>
    </anypoint-input>

    <div class="cert-file" data-type="cert">
    ${certificateFile ? this._certificateInfoTemplate(certificateFile) : this._certificateInput()}
    </div>
    ${this._certPasswordTemplate()}
    ${this._keyTemplate()}

    <div class="action-button">
      <anypoint-button
        emphasis="high"
        data-action="accept"
        @click="${this._importHandler}"
        ?disabled="${acceptDisabled}"
      >
        Import
      </anypoint-button>
      ${loading ? html`Working...` : ''}
    </div>

    <input type="file" hidden id="cf" @change="${this._certFileHandler}"/>
    <input type="file" hidden id="kf" @change="${this._keyFileHandler}"/>
    `;
  }

  render() {
    switch(this._page) {
      case 1: return this._filesFormTemplate();
      default: return this._startScreenTemplate();
    }
  }
}
