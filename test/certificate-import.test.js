import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '@advanced-rest-client/arc-models/client-certificate-model.js';
import '../certificate-import.js';

describe('<certificate-import>', function() {
  async function basicFixture() {
    return await fixture(html`<certificate-import></certificate-import>`);
  }

  async function typeFixture(type) {
    const el = await fixture(html`<certificate-import
      .importType="${type}"></certificate-import>`);
    el._page = 1;
    await nextFrame();
    return el;
  }

  async function filesFixture(type) {
    const el = await fixture(html`<certificate-import
      .importType="${type}"></certificate-import>`);
    el._page = 1;
    const blob = new Blob(['test']);
    blob.name = 'test';
    el._certificateFile = blob;
    el._keyFile = blob;
    await nextFrame();
    return el;
  }

  async function modelFilesFixture(type) {
    const node = await fixture(html`<div>
      <client-certificate-model></client-certificate-model>
      <certificate-import
      .importType="${type}"></certificate-import>
      </div>`);
    const el = node.querySelector('certificate-import');
    el._page = 1;
    const blob = new Blob(['test']);
    blob.name = 'test';
    el._certificateFile = blob;
    el._keyFile = blob;
    await nextFrame();
    return el;
  }

  async function untilTransitionEnds(element) {
    return new Promise((resolve) => {
      element.addEventListener('transitionend', () => resolve());
    })
  }

  describe('pages rendering', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renders default (start) page', () => {
      const node = element.shadowRoot.querySelector('.type-options');
      assert.ok(node);
    });

    it('switches to import page when p12 button click', async () => {
      const button = element.shadowRoot.querySelector('.cert-type-option[data-type=p12]');
      MockInteractions.tap(button);
      await untilTransitionEnds(element);
      assert.equal(element._page, 1, 'page is switched');
      assert.equal(element.importType, 'p12', 'importType is set');
    });

    it('switches to import page when pem button click', async () => {
      const button = element.shadowRoot.querySelector('.cert-type-option[data-type=pem]');
      MockInteractions.tap(button);
      await untilTransitionEnds(element);
      assert.equal(element._page, 1, 'page is switched');
      assert.equal(element.importType, 'pem', 'importType is set');
    });
  });

  describe('Import rendering options', () => {
    describe('PEM certificate', () => {
      let element;
      beforeEach(async () => {
        element = await typeFixture('pem');
      });

      it('renders name field', () => {
        const node = element.shadowRoot.querySelector('anypoint-input[name=name]');
        assert.ok(node);
      });

      it('renders certificate trigger button', () => {
        const node = element.shadowRoot.querySelector('.cert-file[data-type=cert] anypoint-button');
        assert.ok(node);
      });

      it('does not renders password switch button for certificate', () => {
        const node = element.shadowRoot.querySelector('anypoint-switch[data-type=cert]');
        assert.notOk(node);
      });

      it('renders key trigger button', () => {
        const node = element.shadowRoot.querySelector('.cert-file[data-type=key] anypoint-button');
        assert.ok(node);
      });

      it('renders password switch button for key', () => {
        const node = element.shadowRoot.querySelector('anypoint-switch[data-type=key]');
        assert.ok(node);
      });

      it('renders import button', () => {
        const node = element.shadowRoot.querySelector('.action-button anypoint-button');
        assert.ok(node);
      });

      it('import button is disabled by default', () => {
        const node = element.shadowRoot.querySelector('.action-button anypoint-button');
        assert.isTrue(node.disabled);
      });

      it('renders file details instead of certificate trigger button', async () => {
        const blob = new Blob(['test']);
        blob.name = 'test';
        element._certificateFile = blob;
        await nextFrame();
        const button = element.shadowRoot.querySelector('.cert-file[data-type=cert] anypoint-button');
        assert.notOk(button, 'trigger button is not rendered');
        const iconButton = element.shadowRoot.querySelector('.cert-file[data-type=cert] anypoint-icon-button');
        assert.ok(iconButton, 'delete button is rendered');
      });

      it('certificate delete button clear the file', async () => {
        const blob = new Blob(['test']);
        blob.name = 'test';
        element._certificateFile = blob;
        await nextFrame();
        const iconButton = element.shadowRoot.querySelector('.cert-file[data-type=cert] anypoint-icon-button');
        MockInteractions.tap(iconButton);
        assert.notOk(element.certificateFile);
      });

      it('renders file details instead of key trigger button', async () => {
        const blob = new Blob(['test']);
        blob.name = 'test';
        element._keyFile = blob;
        await nextFrame();
        const button = element.shadowRoot.querySelector('.cert-file[data-type=key] anypoint-button');
        assert.notOk(button, 'trigger button is not rendered');
        const iconButton = element.shadowRoot.querySelector('.cert-file[data-type=key] anypoint-icon-button');
        assert.ok(iconButton, 'delete button is rendered');
      });

      it('certificate delete button clear the file', async () => {
        const blob = new Blob(['test']);
        blob.name = 'test';
        element._keyFile = blob;
        await nextFrame();
        const iconButton = element.shadowRoot.querySelector('.cert-file[data-type=key] anypoint-icon-button');
        MockInteractions.tap(iconButton);
        assert.notOk(element.keyFile);
      });
    });

    describe('p12 certificate', () => {
      let element;
      beforeEach(async () => {
        element = await typeFixture('p12');
      });

      it('renders name field', () => {
        const node = element.shadowRoot.querySelector('anypoint-input[name=name]');
        assert.ok(node);
      });

      it('renders certificate trigger button', () => {
        const node = element.shadowRoot.querySelector('.cert-file[data-type=cert] anypoint-button');
        assert.ok(node);
      });

      it('renders password switch button for certificate', () => {
        const node = element.shadowRoot.querySelector('anypoint-switch[data-type=cert]');
        assert.ok(node);
      });

      it('does no render key trigger button', () => {
        const node = element.shadowRoot.querySelector('.cert-file[data-type=key] anypoint-button');
        assert.notOk(node);
      });

      it('does not render password switch button for key', () => {
        const node = element.shadowRoot.querySelector('anypoint-switch[data-type=key]');
        assert.notOk(node);
      });

      it('renders import button', () => {
        const node = element.shadowRoot.querySelector('.action-button anypoint-button');
        assert.ok(node);
      });

      it('import button is disabled by default', () => {
        const node = element.shadowRoot.querySelector('.action-button anypoint-button');
        assert.isTrue(node.disabled);
      });
    });

    describe('import button state', () => {
      it('is disabled when no file', async () => {
        const element = await typeFixture('p12');
        const button = element.shadowRoot.querySelector('.action-button anypoint-button');
        assert.isTrue(button.disabled);
      });

      it('is not disabled when has p12 file', async () => {
        const element = await typeFixture('p12');
        const blob = new Blob(['test']);
        blob.name = 'test';
        element._certificateFile = blob;
        await nextFrame();
        const button = element.shadowRoot.querySelector('.action-button anypoint-button');
        assert.isFalse(button.disabled);
      });

      it('is not disabled when has pem cert and key files', async () => {
        const element = await typeFixture('pem');
        const blob = new Blob(['test']);
        blob.name = 'test';
        element._certificateFile = blob;
        element._keyFile = blob;
        await nextFrame();
        const button = element.shadowRoot.querySelector('.action-button anypoint-button');
        assert.isFalse(button.disabled);
      });

      it('is disabled when missing pem file', async () => {
        const element = await typeFixture('pem');
        const blob = new Blob(['test']);
        blob.name = 'test';
        element._keyFile = blob;
        await nextFrame();
        const button = element.shadowRoot.querySelector('.action-button anypoint-button');
        assert.isTrue(button.disabled);
      });
    });

    describe('getConfig()', () => {
      describe('PEM certificate', () => {
        let element;
        beforeEach(async () => {
          element = await filesFixture('pem');
        });

        it('returns basic data', async () => {
          const result = await element.getConfig();
          assert.typeOf(result, 'object', 'Result is an object');
          assert.equal(result.name, '', 'has empty name');
          assert.equal(result.type, 'pem', 'has type');
          assert.typeOf(result.cert, 'object', 'has cert');
          assert.typeOf(result.key, 'object', 'has key');
        });

        it('generates certificate data', async () => {
          const result = await element.getConfig();
          const item = result.cert;
          assert.typeOf(item, 'object', 'cert is an object');
          assert.typeOf(item.data, 'string', 'has data as string');
          assert.isUndefined(item.passphrase);
        });

        it('ignores passphrase when _certificateHasPassword is not set', async () => {
          const result = await element.getConfig();
          const item = result.cert;
          assert.typeOf(item, 'object', 'cert is an object');
          assert.typeOf(item.data, 'string', 'has data as string');
          assert.isUndefined(item.passphrase);
        });

        it('generates key data', async () => {
          const result = await element.getConfig();
          const item = result.key;
          assert.typeOf(item, 'object', 'key is an object');
          assert.typeOf(item.data, 'string', 'has data as string');
          assert.isUndefined(item.passphrase);
        });

        it('generates key data with passphrase when _keyHasPassword is set', async () => {
          const button = element.shadowRoot.querySelector('anypoint-switch[data-type=key]');
          MockInteractions.tap(button);
          await nextFrame();
          const input = element.shadowRoot.querySelector('anypoint-masked-input[name=_keyPassword]');
          input.value = 'test';
          const result = await element.getConfig();
          const item = result.key;
          assert.equal(item.passphrase, 'test');
        });

        it('generates key data with default passphrase ', async () => {
          const button = element.shadowRoot.querySelector('anypoint-switch[data-type=key]');
          MockInteractions.tap(button);
          await nextFrame();
          const result = await element.getConfig();
          const item = result.key;
          assert.equal(item.passphrase, '');
        });
      });

      describe('p12 certificate', () => {
        let element;
        beforeEach(async () => {
          element = await filesFixture('p12');
        });

        it('returns basic data', async () => {
          const result = await element.getConfig();
          assert.typeOf(result, 'object', 'Result is an object');
          assert.equal(result.name, '', 'has empty name');
          assert.equal(result.type, 'p12', 'has type');
          assert.typeOf(result.cert, 'object', 'has cert');
          assert.isUndefined(result.key, 'key is not set');
        });

        it('generates certificate data', async () => {
          const result = await element.getConfig();
          const item = result.cert;
          assert.typeOf(item, 'object', 'cert is an object');
          assert.typeOf(item.data, 'uint8array', 'has data as array');
          assert.isUndefined(item.passphrase);
        });

        it('generates cert data with passphrase when _certificateHasPassword is set', async () => {
          const button = element.shadowRoot.querySelector('anypoint-switch[data-type=cert]');
          MockInteractions.tap(button);
          await nextFrame();
          const input = element.shadowRoot.querySelector('anypoint-masked-input[name=_certificatePassword]');
          input.value = 'test';
          const result = await element.getConfig();
          const item = result.cert;
          assert.equal(item.passphrase, 'test');
        });

        it('generates cert data with default passphrase', async () => {
          const button = element.shadowRoot.querySelector('anypoint-switch[data-type=cert]');
          MockInteractions.tap(button);
          await nextFrame();
          const result = await element.getConfig();
          const item = result.cert;
          assert.equal(item.passphrase, '');
        });
      });
    });
  });

  describe('Canceling import flow', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('dispatches close event when canel button is pressed', () => {
      const spy = sinon.spy();
      element.addEventListener('close', spy);
      const button = element.shadowRoot.querySelector('[data-action="cancel-header"]');
      MockInteractions.tap(button);
      assert.isTrue(spy.called);
    });

    it('sets _page to 0', () => {
      element.cancel();
      assert.equal(element._page, 0);
    });
  });

  describe('Import flow', () => {
    before(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    it('imports new certificate', async () => {
      const element = await modelFilesFixture('p12');
      await element.accept();
      const items = await DataGenerator.getDatastoreClientCertificates();
      const [index, data] = items;
      assert.lengthOf(index, 1, 'Has an index item');
      assert.lengthOf(data, 1, 'Has a data item');
    });

    it('calls accept() when import is clicked', async () => {
      const element = await filesFixture('p12');
      const spy = sinon.spy(element, 'accept');
      const button = element.shadowRoot.querySelector('[data-action="accept"]');
      MockInteractions.tap(button);
      assert.isTrue(spy.called);
    });

    it('ignores accept event when not valid', async () => {
      const element = await typeFixture('p12');
      const spy = sinon.spy();
      element.addEventListener('accept', spy);
      assert.notOk(element.loading);
    });
  });

  describe('native file input handlers', () => {
    let element;
    let file;
    beforeEach(async () => {
      element = await filesFixture('pem');
      file = new Blob(['test']);
      file.name = 'test';
    });

    it('sets _certificateFile data from field event', () => {
      element._certificateFile = file;
      const input = element.shadowRoot.querySelector('#cf');
      input.dispatchEvent(new CustomEvent('change'));
      assert.notOk(element._certificateFile);
    });

    it('sets _certificateFile data', () => {
      element._certFileHandler({
        target: {
          files: [file]
        }
      });
      assert.equal(element._certificateFile, file);
    });

    it('sets _keyFile data from field event', () => {
      element._keyFile = file;
      const input = element.shadowRoot.querySelector('#kf');
      input.dispatchEvent(new CustomEvent('change'));
      assert.notOk(element._keyFile);
    });

    it('sets _keyFile data', () => {
      element._keyFileHandler({
        target: {
          files: [file]
        }
      });
      assert.equal(element._keyFile, file);
    });
  });
});
