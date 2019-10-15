import { fixture, assert, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '@advanced-rest-client/arc-models/client-certificate-model.js';
import '../certificate-details.js';

describe('<certificate-details>', function() {
  async function modelFixture() {
    const area = await fixture(html`
      <div>
        <client-certificate-model></client-certificate-model>
        <certificate-details></certificate-details>
      </div>
      `);
    return area.querySelector('certificate-details');
  }

  async function dataFixture(certificate) {
    return await fixture(html`<certificate-details
      .certificate="${certificate}"></certificate-details>`);
  }

  describe('Querying for the certificate', () => {
    let id;

    before(async () => {
      const [insert] = await DataGenerator.insertCertificatesData({
        size: 1
      });
      id = insert._id;
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    let element;
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('queryCertInfo sets certificate data', async () => {
      await element.queryCertInfo(id);
      assert.typeOf(element.certificate, 'object', 'certificate is set');
      assert.equal(element.certificate._id, id, 'has correct certificate');
    });

    it('resets certificate on error', async () => {
      element.certificate = {
        cert: {}
      };
      await element.queryCertInfo('non-existing');
      assert.isUndefined(element.certificate);
    });

    it('resets querying flag', async () => {
      await element.queryCertInfo(id);
      assert.isFalse(element.querying);
    });

    it('queries for data when certId attribute is set', async () => {
      let event;
      element.addEventListener('client-certificate-get', (e) => { event = e; });
      element.certId = id;
      await event.detail.result;
      assert.typeOf(element.certificate, 'object', 'certificate is set');
      assert.equal(element.certificate._id, id, 'has correct certificate');
    });
  });

  describe('Data rendering', () => {
    it('renders title', async () => {
      const item = DataGenerator.generateClientCertificate();
      const element = await dataFixture(item);
      const header = element.shadowRoot.querySelector('h2');
      assert.dom.equal(header, `<h2>${item.name}</h2>`);
    });

    it('renders time', async () => {
      const item = DataGenerator.generateClientCertificate();
      const element = await dataFixture(item);
      const dt = element.shadowRoot.querySelector('date-time');
      assert.ok(dt, 'date-time element is rendered');
      assert.equal(dt.date, item.created, 'element has timestamp value');
    });

    it('renders type', async () => {
      const item = DataGenerator.generateClientCertificate();
      const element = await dataFixture(item);
      const dt = element.shadowRoot.querySelector('.meta-row[data-type="type"] .value');
      assert.ok(dt, 'type is rendered');
      assert.equal(dt.textContent.trim(), item.type, 'type has value');
    });

    it('renders files info for p12', async () => {
      const item = DataGenerator.generateClientCertificate();
      item.type = 'p12';
      delete item.key;
      const element = await dataFixture(item);
      const dt = element.shadowRoot.querySelector('.meta-row[data-type="files"] .value');
      assert.ok(dt, 'type is rendered');
      assert.equal(dt.textContent.trim(), 'Certificate', 'has "Certificate"');
    });

    it('renders files info for pem', async () => {
      const item = DataGenerator.generateClientCertificate();
      item.type = 'pem';
      item.key = item.cert;
      const element = await dataFixture(item);
      const dt = element.shadowRoot.querySelector('.meta-row[data-type="files"] .value');
      assert.ok(dt, 'type is rendered');
      assert.equal(dt.textContent.trim(), 'Certificate, Key', 'has "Certificate, Key"');
    });
  });

  describe('Delete action', () => {
    let element;
    beforeEach(async () => {
      const item = DataGenerator.generateClientCertificate();
      element = await dataFixture(item);
    });

    it('dispatches delete event when button click', () => {
      const spy = sinon.spy();
      element.addEventListener('delete', spy);
      const button = element.shadowRoot.querySelector('anypoint-button[data-action="delete-certificate"]');
      MockInteractions.tap(button);
      assert.isTrue(spy.called);
    });
  });
});
