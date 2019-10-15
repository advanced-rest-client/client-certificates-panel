import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '@advanced-rest-client/arc-models/client-certificate-model.js';
import '../client-certificates-panel.js';

describe('<client-certificates-panel>', function() {
  async function basicFixture() {
    return await fixture(html`<client-certificates-panel></client-certificates-panel>`);
  }

  async function queryDataFixture() {
    const elmRequest = fixture(html`<div>
      <client-certificate-model></client-certificate-model>
      <client-certificates-panel></client-certificates-panel>
    </div>`);
    return new Promise((resolve) => {
      window.addEventListener('client-certificate-list', function f(e) {
        window.removeEventListener('client-certificate-list', f);
        const { detail } = e;
        setTimeout(() => {
          detail.result
          .then(() => elmRequest)
          .then((node) => {
            resolve(node.querySelector('client-certificates-panel'));
          });
        });
      });
    });
  }

  async function untilAfterQuery(element, result) {
    return new Promise((resolve) => {
      element.addEventListener('client-certificate-list', function f(e) {
        element.removeEventListener('client-certificate-list', f);
        e.preventDefault();
        e.detail.result = Promise.resolve(result || []);
        setTimeout(() => resolve());
      });
      element.reset();
    });
  }

  describe('Empty state', () => {
    it('render empty state', async () => {
      const element = await basicFixture();
      await untilAfterQuery(element);
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.ok(node);
    });

    it('queries for certificates when initialized', async () => {
      const spy = sinon.spy();
      window.addEventListener('client-certificate-list', spy);
      await basicFixture();
      assert.isTrue(spy.called);
    });

    it('import button renders inmport element', async () => {
      const element = await basicFixture();
      await untilAfterQuery(element);
      const button = element.shadowRoot.querySelector('[data-action="empty-add-cert"]');
      MockInteractions.tap(button);
      await nextFrame();
      const node = element.shadowRoot.querySelector('certificate-import');
      assert.ok(node);
    });
  });

  describe('Data list', () => {
    before(async () => {
      await DataGenerator.insertCertificatesData({});
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    let element;
    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('has items set', () => {
      assert.lengthOf(element.items, 15);
    });

    it('renders list items', () => {
      const nodes = element.shadowRoot.querySelectorAll('.list-item');
      assert.lengthOf(nodes, 15);
    });

    it('does not render empty state', async () => {
      const node = element.shadowRoot.querySelector('.empty-screen');
      assert.notOk(node);
    });
  });

  describe('datastore-destroyed event handler', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.items = DataGenerator.generateClientCertificates({ size: 5 });
    });

    it('resets items', () => {
      document.body.dispatchEvent(new CustomEvent('datastore-destroyed', {
        bubbles: true,
        detail: {
          datastore: 'client-certificates'
        }
      }));
      assert.deepEqual(element.items, []);
    });

    it('ignores other data stores', () => {
      document.body.dispatchEvent(new CustomEvent('datastore-destroyed', {
        bubbles: true,
        detail: {
          datastore: 'saved-requests'
        }
      }));
      assert.lengthOf(element.items, 5);
    });
  });

  describe('data-imported event handler', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls reset()', () => {
      const spy = sinon.spy(element, 'reset');
      document.body.dispatchEvent(new CustomEvent('data-imported', {
        bubbles: true
      }));
      assert.isTrue(spy.called);
    });
  });

  describe('client-certificate-delete event handler', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      const items = DataGenerator.generateClientCertificates({ size: 5 });
      await untilAfterQuery(element, items);
    });

    function fire(id, cancelable) {
      if (cancelable === undefined) {
        cancelable = false;
      }
      const e = new CustomEvent('client-certificate-delete', {
        cancelable,
        bubbles: true,
        detail: {
          id
        }
      });
      document.body.dispatchEvent(e);
    }

    it('removes existing item', () => {
      const item = element.items[0];
      fire(item._id);
      assert.lengthOf(element.items, 4);
    });

    it('ignores cancelable event', () => {
      const item = element.items[0];
      fire(item._id, true);
      assert.lengthOf(element.items, 5);
    });

    it('ignores when not on the list', () => {
      fire('some-id', true);
      assert.lengthOf(element.items, 5);
    });
  });

  describe('client-certificate-insert event handler', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      const items = DataGenerator.generateClientCertificates({ size: 5 });
      items.forEach((item, index) => item._id = index + '_');
      await untilAfterQuery(element, items);
    });

    function fire(detail, cancelable) {
      if (cancelable === undefined) {
        cancelable = false;
      }
      const e = new CustomEvent('client-certificate-insert', {
        cancelable,
        bubbles: true,
        detail
      });
      document.body.dispatchEvent(e);
    }

    it('updates existing item', () => {
      let item = element.items[0];
      item = Object.assign({}, item);
      item.name = 'test';
      fire(item);
      assert.equal(element.items[0].name, 'test');
    });

    it('ignores cancelable event', () => {
      let item = element.items[0];
      item = Object.assign({}, item);
      item.name = 'test';
      fire(item, true);
      assert.notEqual(element.items[0].name, 'test');
    });

    it('Adds new item to the list', () => {
      const item = DataGenerator.generateClientCertificate();
      item._id = '6_';
      fire(item);
      assert.lengthOf(element.items, 6);
    });
  });

  describe('Details rendering', () => {
    before(async () => {
      await DataGenerator.insertCertificatesData({});
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    let element;
    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('opens detail dialog when detail button is clicked', () => {
      const node = element.shadowRoot.querySelector('.list-item anypoint-button');
      MockInteractions.tap(node);

      assert.equal(element.openedDetailsId, element.items[0]._id, 'openedDetailsId is set');
      assert.isTrue(element.certDetailsOpened);
    });

    it('sets certId on details panel', async () => {
      const button = element.shadowRoot.querySelector('.list-item anypoint-button');
      MockInteractions.tap(button);
      await nextFrame();
      const node = element.shadowRoot.querySelector('certificate-details');
      assert.equal(node.certId, element.items[0]._id);
    });

    async function untilDeleted(element) {
      return new Promise((resolve, reject) => {
        element.addEventListener('client-certificate-delete', function f(e) {
          element.removeEventListener('client-certificate-delete', f);
          const { detail } = e;
          setTimeout(() => {
            detail.result
            .then(() => {
              // breaks the promise chain
              setTimeout(() => resolve());
            })
            .catch((e) => reject(e));
          });
        });
        const node = element.shadowRoot.querySelector('certificate-details');
        node.dispatchEvent(new CustomEvent('delete'));
      });
    }

    it('deletes an item when delete event is handled', async () => {
      const button = element.shadowRoot.querySelector('.list-item anypoint-button');
      MockInteractions.tap(button);
      await nextFrame();
      await untilDeleted(element);
      assert.lengthOf(element.items, 14);
    });
  });

  describe('Export certificates flow', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      const items = DataGenerator.generateClientCertificates({ size: 5 });
      await untilAfterQuery(element, items);
    });

    it('opens export options when menu item is clicked', () => {
      const spy = sinon.spy(element, '_deselectMainMenu');
      const button = element.shadowRoot.querySelector('[data-action="export-all"]');
      MockInteractions.tap(button);
      assert.isTrue(spy.called, 'deselects main menu');
      assert.isTrue(element._exportOptionsOpened, 'sets _exportOptionsOpened');
    });

    it('cancels the export ', async () => {
      const button = element.shadowRoot.querySelector('[data-action="export-all"]');
      MockInteractions.tap(button);
      await nextFrame();
      const node = element.shadowRoot.querySelector('export-options');
      node.dispatchEvent(new CustomEvent('cancel'));
      assert.isFalse(element._exportOptionsOpened);
    });

    it('accepts export and dispatches event ', async () => {
      const button = element.shadowRoot.querySelector('[data-action="export-all"]');
      MockInteractions.tap(button);
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener('arc-data-export', spy);
      const node = element.shadowRoot.querySelector('export-options');
      node.dispatchEvent(new CustomEvent('accept', {
        detail: {
          options: {},
          providerOptions: {}
        }
      }));
      assert.isTrue(spy.called);
    });
  });

  describe('_doExportItems()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      const items = DataGenerator.generateClientCertificates({ size: 5 });
      await untilAfterQuery(element, items);
    });

    it('Dispatches arc-data-export event', (done) => {
      window.addEventListener('arc-data-export', function f(e) {
        window.removeEventListener('arc-data-export', f);
        assert.isTrue(e.cancelable, 'Event is cancelable');
        assert.isTrue(e.bubbles, 'Event bubbles');
        assert.equal(e.detail.options.kind, 'ARC#ClientCertificate', 'kind is set');
        assert.equal(e.detail.options.file, 'test.json', 'file is set');
        assert.equal(e.detail.options.provider, 'file', 'provider is set');
        assert.typeOf(e.detail.data, 'object', 'data is an object');
        // assert.deepEqual(e.detail.data.cookies, element.items);
        done();
      });
      element._doExportItems({
        options: {
          provider: 'file',
          file: 'test.json'
        }
      });
    });

    it('opens error toast when no export adapter', async () => {
      const spy = sinon.spy(element, '_handleException');
      await element._doExportItems({
        options: {
          provider: 'file',
          file: 'test.json'
        }
      });
      assert.isTrue(spy.called);
    });

    it('opens drive toast when exporting to G-Drive', async () => {
      element.addEventListener('arc-data-export', function f(e) {
        element.removeEventListener('arc-data-export', f);
        e.preventDefault();
        e.detail.result = Promise.resolve({});
      });
      await element._doExportItems({
        options: {
          provider: 'drive',
          file: 'test.json'
        }
      });
      assert.isTrue(element.shadowRoot.querySelector('#driveSaved').opened);
    });

    it('does not opens drive toast when exporting to file', async () => {
      element.addEventListener('arc-data-export', function f(e) {
        element.removeEventListener('arc-data-export', f);
        e.preventDefault();
        e.detail.result = Promise.resolve({});
      });
      await element._doExportItems({
        options: {
          provider: 'file',
          file: 'test.json'
        }
      });
      assert.isFalse(element.shadowRoot.querySelector('#driveSaved').opened);
    });
  });

  describe('All data delete', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      const items = DataGenerator.generateClientCertificates({ size: 5 });
      await untilAfterQuery(element, items);
    });

    it('opens delete confirmation dialog', () => {
      const node = element.shadowRoot.querySelector('[data-action="delete-all"]');
      MockInteractions.tap(node);
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      assert.isTrue(dialog.opened);
    });

    it('requests file export', async () => {
      const spy = sinon.spy(element, '_dispatchExportData');
      const node = element.shadowRoot.querySelector('[data-action="delete-export-all"]');
      MockInteractions.tap(node);
      assert.isTrue(spy.calledOnce);
      const requestArg = spy.args[0][0];
      assert.isTrue(requestArg, 'requests are set to true');
      const detailArg = spy.args[0][1];
      assert.typeOf(detailArg, 'object', 'has the detail argument');
      assert.equal(detailArg.options.kind, 'ARC#ClientCertificate', 'has "kind" property on the options');
      assert.equal(detailArg.options.provider, 'file', 'has "provider" property on the options');
      assert.notEmpty(detailArg.options.file, 'has "file" property on the options');
    });

    it('does not delete data when dialog is cancelled', async () => {
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      dialog.opened = true;
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener('destroy-model', spy);
      MockInteractions.click(element);
      await aTimeout(100);
      assert.isFalse(dialog.opened);
      assert.isFalse(spy.called);
    });

    it('clears the data store when accepted', async () => {
      const spy = sinon.spy();
      element.addEventListener('destroy-model', spy);
      const dialog = element.shadowRoot.querySelector('#dataClearDialog');
      dialog.opened = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('[dialog-confirm]');
      MockInteractions.tap(node);
      await aTimeout(200);
      assert.isFalse(dialog.opened, 'dialog is not opened');
      assert.isTrue(spy.called, 'delete event is dispatched');
      assert.deepEqual(spy.args[0][0].detail.models, ['client-certificates'], 'models is set');
    });
  });
});
