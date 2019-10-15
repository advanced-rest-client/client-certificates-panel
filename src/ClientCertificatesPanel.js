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
import { LitElement, html } from 'lit-element';
import { moreVert, exportVariant, deleteIcon } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@polymer/paper-progress/paper-progress.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-fab/paper-fab.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog.js';
import '@advanced-rest-client/export-options/export-options.js';
import '@advanced-rest-client/bottom-sheet/bottom-sheet.js';
import styles from './styles.js';
import { certificate } from './icons.js'
import '../certificate-import.js';
import '../certificate-details.js';
/**
 * A view that renders list of cliet certificates installed in the application.
 *
 * It allows to preview certificate details, add new certificate, and
 * to remove certificate from the store.
 *
 * The element uses web events to communicate with the data store. Your application
 * can have own implementation but we suggest using `@advanced-rest-client/arc-models`
 * with `client-certificate-model` to store certificates in browser's internal
 * data store.
 * Consider this when 3rd party scripts runs on your page.
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
export class ClientCertificatesPanel extends LitElement {
  static get styles() {
    return styles;
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
      // List of cookies to display
      items: { type: Array },
      // True when loading data from the datastore.
      loading: { type: Boolean },
      /**
       * When set a certificate details dialog is opened.
       */
      certDetailsOpened: { type: Boolean },
      /**
       * An ID of the certificate to be passed on the details view element.
       */
      openedDetailsId: { type: String },

      _page: { type: Number },
      /**
       * Indicates that the export options panel is currently rendered.
       */
      _exportOptionsOpened: { type: Boolean },
      _exportOptions: { type: Object }
    };
  }
  /**
   * @return {Boolean} `true` if `items` is set and has cookies
   */
  get hasItems() {
    const { items } = this;
    return !!(items && items.length);
  }
  /**
   * @return {Boolean} `true` when the lists is hidden.
   */
  get listHidden() {
    const { hasItems } = this;
    return !hasItems;
  }
  /**
   * A computed flag that determines that the query to the databastore
   * has been performed and empty result was returned.
   * This can be true only if not in search.
   * @return {Boolean}
   */
  get dataUnavailable() {
    const { hasItems, loading } = this;
    return !loading && !hasItems;
  }

  constructor() {
    super();
    this._dbDestroyHandler = this._dbDestroyHandler.bind(this);
    this._dataImportHandler = this._dataImportHandler.bind(this);
    this._certDeleteHandler = this._certDeleteHandler.bind(this);
    this._certInsertHandler = this._certInsertHandler.bind(this);

    this._page = 0;
    this._exportOptions = {
      file: this._generateFileName(),
      provider: 'file',
      providerOptions: {
        parents: ['My Drive']
      }
    }
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    window.addEventListener('datastore-destroyed', this._dbDestroyHandler);
    window.addEventListener('data-imported', this._dataImportHandler);
    window.addEventListener('client-certificate-delete', this._certDeleteHandler);
    window.addEventListener('client-certificate-insert', this._certInsertHandler);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    window.removeEventListener('datastore-destroyed', this._dbDestroyHandler);
    window.removeEventListener('data-imported', this._dataImportHandler);
    window.removeEventListener('client-certificate-delete', this._certDeleteHandler);
    window.removeEventListener('client-certificate-insert', this._certInsertHandler);
  }

  firstUpdated() {
    if (!this.items) {
      this.reset();
    }
  }

  _dbDestroyHandler(e) {
    const { datastore } = e.detail;
    if (datastore !== 'client-certificates') {
      return;
    }
    this.items = [];
  }

  /**
   * Handler for `data-imported` cutom event.
   * Refreshes data state.
   */
  _dataImportHandler() {
    this.reset();
  }

  _certDeleteHandler(e) {
    if (e.cancelable) {
      return;
    }
    const { id } = e.detail;
    const items = this.items || [];
    const index = items.findIndex((i) => i._id === id);
    if (index === -1) {
      return;
    }
    items.splice(index, 1);
    this.items = [...items];
  }

  _certInsertHandler(e) {
    if (e.cancelable) {
      return;
    }
    const item = e.detail;
    const items = this.items || [];
    const index = items.findIndex((i) => i._id === item._id);
    if (index === -1) {
      items.push(item);
    } else {
      items[index] = item;
    }
    this.items = [...items];
  }

  reset() {
    this.loading = false;
    this.items = undefined;
    this.queryCertificates();
  }
  /**
   * Handles an exception by sending exception details to GA.
   * @param {String} message A message to send.
   */
  _handleException(message) {
    const e = new CustomEvent('send-analytics', {
     bubbles: true,
     composed: true,
     detail: {
       type: 'exception',
       description: message
     }
    });
    this.dispatchEvent(e);
    const toast = this.shadowRoot.querySelector('#errorToast');
    toast.text = message;
    toast.opened = true;
  }

  /**
   * Queries application for list of cookies.
   * It dispatches `session-cookie-list-all` cuystom event.
   * @return {Promise} Resolved when cookies are available.
   */
  async queryCertificates() {
    this.loading = true;
    const e = new CustomEvent('client-certificate-list', {
      detail: {},
      cancelable: true,
      composed: true,
      bubbles: true
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this.loading = false;
      this._handleException('Certificates store not redy.');
      return;
    }
    try {
      this.items = await e.detail.result;
    } catch (e) {
      this.items = undefined;
      this._handleException(e.message);
    }
    this.loading = false;
  }

  _deleteCertDetails() {
    const id = this.openedDetailsId;
    this.openedDetailsId = undefined;
    this.certDetailsOpened = false;
    this._delete(id);
  }
  /**
   * Performs a delete action of cookie items.
   *
   * @param {String} id An id of the cookie to delete
   * @return {Promise}
   */
  async _delete(id) {
    const e = new CustomEvent('client-certificate-delete', {
      detail: {
        id
      },
      cancelable: true,
      composed: true,
      bubbles: true
    });
    this.dispatchEvent(e);
    if (!e.defaultPrevented) {
      this._handleException('Cookies model not in the DOM');
      return;
    }
    try {
      return await e.detail.result;
    } catch (e) {
      this._handleException(e.message);
    }
  }
  /**
   * Handler for `accept` event dispatched by export options element.
   * @param {CustomEvent} e
   * @return {Promise} Result of calling `_doExportItems()`
   */
  async _acceptExportOptions(e) {
    this._exportOptionsOpened = false;
    const { detail } = e;
    return await this._doExportItems(detail);
  }

  _cancelExportOptions() {
    this._exportOptionsOpened = false;
  }
  /**
   * Calls `_dispatchExportData()` from requests lists mixin with
   * prepared arguments
   *
   * @param {String} detail Export configuration
   * @return {Promise}
   */
  async _doExportItems(detail) {
    detail.options.kind = 'ARC#ClientCertificate';
    const request = this._dispatchExportData(true, detail);
    if (!request.detail.result) {
      this._handleException('Certificates: Export module not found');
      return;
    }
    try {
      await request.detail.result;
      if (detail.options.provider === 'drive') {
        // TODO: Render link to the folder
        this.shadowRoot.querySelector('#driveSaved').opened = true;
      }
    } catch (e) {
      this._handleException(e.message);
    }
  }
  /**
   * Dispatches `arc-data-export` event and returns it.
   * @param {Array<Object>|Boolean} items List of items to export.
   * @param {Object} opts
   * @return {CustomEvent}
   */
  _dispatchExportData(items, opts) {
    const e = new CustomEvent('arc-data-export', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        options: opts.options,
        providerOptions: opts.providerOptions,
        data: {
          'client-certificates': items
        }
      }
    });
    this.dispatchEvent(e);
    return e;
  }
  /**
   * Menu item handler to export all data to file
   * @return {Promise} Result of calling `_doExportItems()`
   */
  _exportAllFile() {
    const detail = {
      options: {
        file: this._generateFileName(),
        provider: 'file'
      }
    };
    return this._doExportItems(detail);
  }

  /**
   * Menu item handler to export all data to file
   */
  openExportAll() {
    this._deselectMainMenu();
    this._exportOptionsOpened = true;
  }

  _deselectMainMenu() {
    setTimeout(() => {
      const menuOptions = this.shadowRoot.querySelector('#mainMenuOptions');
      if (menuOptions) {
        menuOptions.selected = null;
      }
    });
  }

  // Handler for delete all menu option click
  _deleteAllClick() {
    this._deselectMainMenu();
    const dialog = this.shadowRoot.querySelector('#dataClearDialog');
    dialog.opened = true;
  }
  // Called when delete datastore dialog is closed.
  _onClearDialogResult(e) {
    if (!e.detail.confirmed) {
      return;
    }
    const { items } = this;
    if (!items || !items.length) {
      return;
    }
    this.dispatchEvent(new CustomEvent('destroy-model', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        models: ['client-certificates']
      }
    }));
  }
  /**
   * Opens an empty cookie editor.
   */
  addCertificate() {
    this._deselectMainMenu();
    this._page = 1;
  }
  /**
   * Generates file name for the export options panel.
   * @return {String}
   */
  _generateFileName() {
    return 'arc-client-certificates.json';
  }

  _cancelImport() {
    this._page = 0;
  }

  async _acceptImport(e) {
    const { detail, target } = e;
    try {
      await this._importCert(detail);
      target.loading = false;
      this._page = 0;
    } catch (e) {
      target.loading = false;
      this._handleException(`Cert manager: ${e.message}`);
    }
  }

  async _importCert(opts) {
    if (!opts.name) {
      opts.name = new Date().toGMTString();
    }
    const e = this.dispatchImportCert(opts);
    await e.detail.result;
  }

  dispatchImportCert(value) {
    const e = new CustomEvent('client-certificate-insert', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        value
      }
    });
    this.dispatchEvent(e);
    return e;
  }

  _sheetClosedHandler(e) {
    const prop = e.target.dataset.openProperty;
    this[prop] = e.detail.value;
  }

  _certDetailsHandler(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.openedDetailsId = this.items[index]._id;
    this.certDetailsOpened = true;
  }

  _headerTemplate() {
    const { compatibility, dataUnavailable } = this;
    if (dataUnavailable) {
      return '';
    }
    return html`<div class="header">
      <h2>Client certificates</h2>
      <div class="header-actions">
        <anypoint-menu-button
          dynamicalign
          closeOnActivate
          id="mainMenu"
          ?compatibility="${compatibility}">
          <anypoint-icon-button
            aria-label="Activate to open context menu"
            slot="dropdown-trigger"
            ?compatibility="${compatibility}">
            <span class="icon">${moreVert}</span>
          </anypoint-icon-button>
          <anypoint-listbox
            slot="dropdown-content"
            id="mainMenuOptions"
            ?compatibility="${compatibility}"
          >
            <anypoint-icon-item
              class="menu-item"
              data-action="export-all"
              ?compatibility="${compatibility}"
              @click="${this.openExportAll}"
            >
              <span class="icon" slot="item-icon">${exportVariant}</span>Export all
            </anypoint-icon-item>
            <anypoint-icon-item
              class="menu-item"
              data-action="delete-all"
              ?compatibility="${compatibility}"
              @click="${this._deleteAllClick}"
            >
              <span class="icon" slot="item-icon">${deleteIcon}</span>Delete all
            </anypoint-icon-item>
          </anypoint-listbox>
        </anypoint-menu-button>
      </div>
    </div>`;
  }

  _busyTemplate() {
    if (!this.loading) {
      return '';
    }
    return html`<paper-progress indeterminate></paper-progress>`;
  }

  _unavailableTemplate() {
    const { dataUnavailable } = this;
    if (!dataUnavailable) {
      return '';
    }
    return html`<div class="empty-screen">
      <span class="empty-image">${certificate}</span>
      <div class="empty-title">Import client certificate</div>
      <p class="empty-info">
        It allows to authenticate a request without a password, if server suppports
        this method.
      </p>
      <div>
        <anypoint-button
          emphasis="medium"
          data-action="empty-add-cert"
          @click="${this.addCertificate}"
          class="empty-add-cert"
        >Import certificate</anypoint-button>
      </div>
    </div>
    `;
  }

  _listTemplate() {
    const { listHidden } = this;
    if (listHidden) {
      return '';
    }
    const items = this.items || [];
    const { compatibility } = this;
    const htmlItems = items.map((item, index) => this._listItemTemplate(item, index,compatibility));
    return html`
    ${htmlItems}
    `;
  }

  _listItemTemplate(item, index, compatibility) {
    const { type, name } = item;
    return html`<anypoint-icon-item ?compatibility="${compatibility}" class="list-item">
      <span slot="item-icon" class="cert-type-ico">${type}</span>
      <anypoint-item-body ?compatibility="${compatibility}">
        ${name}
      </anypoint-item-body>
      <anypoint-button
        aria-label="Activate to open certificate details"
        data-index="${index}"
        ?compatibility="${compatibility}"
        @click="${this._certDetailsHandler}"
      >
        Details
      </anypoint-button>
    </anypoint-icon-item>`;
  }

  _exportTemplate() {
    const { compatibility, outlined, _exportOptions, _exportOptionsOpened } = this;
    return html`
    <bottom-sheet
      id="exportOptionsContainer"
      .opened="${_exportOptionsOpened}"
      data-open-property="_exportOptionsOpened"
      @overlay-closed="${this._sheetClosedHandler}"
    >
      <export-options
        id="exportOptions"
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        withEncrypt
        .file="${_exportOptions.file}"
        .provider="${_exportOptions.provider}"
        .providerOptions="${_exportOptions.providerOptions}"
        @accept="${this._acceptExportOptions}"
        @cancel="${this._cancelExportOptions}"></export-options>
    </bottom-sheet>`;
  }

  _certDetailsTemplate() {
    const { certDetailsOpened, openedDetailsId, compatibility } = this;
    return html`<bottom-sheet
      id="certificateDetailsContainer"
      data-open-property="certDetailsOpened"
      @overlay-closed="${this._sheetClosedHandler}"
      .opened="${certDetailsOpened}"
    >
      <certificate-details
        .certId="${openedDetailsId}"
        ?compatibility="${compatibility}"
        @delete="${this._deleteCertDetails}"></certificate-details>
    </bottom-sheet>`;
  }

  _toastsTemplate() {
    return html`
    <paper-toast id="errorToast" class="error-toast" duration="5000"></paper-toast>
    <paper-toast id="driveSaved" text="Cookies saved on Google Drive."></paper-toast>`;
  }

  _clearDialogTemplate() {
    const {
      compatibility
    } = this;
    return html`<anypoint-dialog
      id="dataClearDialog"
      ?compatibility="${compatibility}"
      @overlay-closed="${this._onClearDialogResult}">
      <div class="title">Remove all certificates?</div>
      <p>Maybe you should create a backup first?</p>
      <div class="buttons">
        <anypoint-button
          ?compatibility="${compatibility}"
          data-action="delete-export-all"
          @click="${this._exportAllFile}"
        >Create backup file</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          dialog-dismiss
        >Cancel</anypoint-button>
        <anypoint-button
          ?compatibility="${compatibility}"
          dialog-confirm
          class="action-button" autofocus
        >Confirm</anypoint-button>
      </div>
    </anypoint-dialog>`;
  }

  _renderList() {
    return html`
    ${this._headerTemplate()}
    ${this._unavailableTemplate()}
    ${this._listTemplate()}`;
  }

  _renderAddCert() {
    return html`
    <certificate-import
      @cancel="${this._cancelImport}"
      @accept="${this._acceptImport}"
    ></certificate-import>
    `;
  }

  _renderPage() {
    if (this._page === 1) {
      return this._renderAddCert();
    }
    return this._renderList();
  }

  render() {
    return html`
    ${this._busyTemplate()}
    ${this._renderPage()}
    ${this._exportTemplate()}
    ${this._certDetailsTemplate()}
    ${this._toastsTemplate()}
    ${this._clearDialogTemplate()}
    <paper-fab icon="arc:add" class="add-fab" @click="${this.addCertificate}"></paper-fab>
    `;
  }
  /**
   * Dispatched when the components asks for the list of installed certificates.
   *
   * This event is cancelable.
   *
   * @event client-certificate-list
   */

  /**
   * Fired when the cookie should be updated by the application.
   *
   * The event is cancelable.
   *
   * @event session-cookie-update
   * @param {Object} cookie A cookie object.
   */

  /**
   * Fired when cookies are to be deleted by the application.
   *
   * The event is cancelable.
   *
   * @event session-cookie-remove
   * @param {Array<Object>} cookies A list of cookie objects.
   */
}
