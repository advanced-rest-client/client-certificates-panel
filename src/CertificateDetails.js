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
import '@advanced-rest-client/date-time/date-time.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@polymer/paper-progress/paper-progress.js';
import { deleteIcon } from '@advanced-rest-client/arc-icons/ArcIcons.js';
/**
 * A view that render a certificate details.
 *
 * Set `certId` proeprty to certificate's identifier and the element
 * queries for the details and populates the view.
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
export class CertificateDetails extends LitElement {
  static get styles() {
    return css`
    :host {
      display: block;
      color: var(--certificate-details-color, inherit);
      background-color: var(--certificate-details-background-color, inherit);
      padding: var(--certificate-details-padding);
      box-sizing: border-box;
      font-size: var(--arc-font-body1-font-size);
      font-weight: var(--arc-font-body1-font-weight);
      line-height: var(--arc-font-body1-line-height);
    }

    h2 {
      font-size: var(--arc-font-headline-font-size);
      font-weight: var(--arc-font-headline-font-weight);
      letter-spacing: var(--arc-font-headline-letter-spacing);
      line-height: var(--arc-font-headline-line-height);
    }

    .meta-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      color: var(--certificate-details-data-list-color, rgba(0, 0, 0, 0.87));
      height: 40px;
    }

    .meta-row .label {
      width: 160px;
    }

    .meta-row .value {
      white-space: var(--arc-font-nowrap-white-space);
      overflow: var(--arc-font-nowrap-overflow);
      text-overflow: var(--arc-font-nowrap-text-overflow);
      flex: 1;
    }

    .actions {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .actions anypoint-button {
      padding-left: 12px;
      padding-right: 12px;
    }

    anypoint-button .icon {
      margin-right: 12px;
      fill: var(--certificate-details-action-icon-color, rgba(0, 0, 0, 0.54));
      display: inline-block;
      width: 24px;
      height: 24px;
    }

    .cert-content {
      overflow: auto;
      max-height: 100px;
      word-break: break-word;
    }
    `;
  }

  static get properties() {
    return {
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * True when currently querying for the certificate
       */
      querying: { type: Boolean },
      /**
       * The ID of the certificate to render.
       * It should not be set when setting `certificate` object.
       */
      certId: { type: String },
      /**
       * A certificate
       */
      certificate: { type: Object }
    };
  }

  get certId() {
    return this._certId;
  }

  set certId(value) {
    const old = this._certId;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._certId = value;
    this.requestUpdate('certId', old);
    if (value) {
      this.queryCertInfo(value);
    }
  }

  async queryCertInfo(id) {
    this.querying = true;
    const e = this.dispatchQueryDetail(id);
    try {
      this.certificate = await e.detail.result;
    } catch (e) {
      this.certificate = undefined;
    }
    this.querying = false;
  }

  dispatchQueryDetail(id) {
    const e = new CustomEvent('client-certificate-get', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        id
      }
    });
    this.dispatchEvent(e);
    return e;
  }

  _deleteCertificateHandler() {
    this.dispatchEvent(new CustomEvent('delete'));
  }

  _headerTemplate(certificate) {
    certificate = certificate || {};
    return html`<h2>${certificate.name}</h2>`;
  }

  _timeTemplate(label, value) {
    if (!value) {
      return '';
    }
    return html`<div class="meta-row">
      <div class="label">
        ${label}
      </div>
      <div class="value">
        <date-time
          .date="${value}"
          year="numeric"
          month="numeric"
          day="numeric"
          hour="numeric"
          minute="numeric"></date-time>
      </div>
    </div>`;
  }

  _actionsTemplate(certificate) {
    if (!certificate) {
      return;
    }
    const { compatibility } = this;
    return html`<anypoint-button
      @click="${this._deleteCertificateHandler}"
      data-action="delete-certificate"
      title="Removes certificate from the data store"
      aria-label="Activate to remove the certificate"
      ?compatibility="${compatibility}"
    >
      <span class="icon">${deleteIcon}</span>
      Delete
    </anypoint-button>`;
  }

  _detailsTemplate(certificate) {
    if (!certificate) {
      return '';
    }
    let filesValue = 'Certificate';
    if (certificate.key) {
      filesValue += ', Key';
    }
    return html`
    ${this._timeTemplate('Created', certificate.created)}
    <div class="meta-row" data-type="type">
      <div class="label">
        Type
      </div>
      <div class="value">
        ${certificate.type}
      </div>
    </div>

    <div class="meta-row" data-type="files">
      <div class="label">
        Files
      </div>
      <div class="value">
        ${filesValue}
      </div>
    </div>
    `;
  }

  _busyTemplate() {
    if (!this.querying) {
      return '';
    }
    return html`<paper-progress indeterminate></paper-progress>`;
  }

  render() {
    const { certificate } = this;
    return html`
    ${this._busyTemplate()}
    ${this._headerTemplate(certificate)}
    ${this._detailsTemplate(certificate)}
    <div class="actions">
      ${this._actionsTemplate(certificate)}
    </div>
    `;
  }
}
