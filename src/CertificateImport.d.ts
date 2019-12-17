/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   src/CertificateImport.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {LitElement, html, css} from 'lit-element';

export {CertificateImport};

declare namespace UiElements {

  /**
   * A view to import a client certificate into the application.
   */
  class CertificateImport extends LitElement {
    readonly certificateFile: any;
    readonly certificatePassword: any;
    readonly keyFile: any;
    readonly keyPassword: any;
    readonly hasKeyImport: any;
    readonly hasKeyPasswordInput: any;
    readonly acceptDisabled: any;
    readonly _importInvalid: any;

    /**
     * Enables outlined theme.
     */
    outlined: boolean|null|undefined;

    /**
     * Enables compatibility with Anypoint components.
     */
    compatibility: boolean|null|undefined;

    /**
     * Either `pem` or `p12`.
     */
    importType: string|null|undefined;

    /**
     * Import name
     */
    name: string|null|undefined;

    /**
     * Trwue when the user clicked on the import button
     */
    loading: boolean|null|undefined;
    _page: number|null|undefined;
    _certificateFile: object|null|undefined;
    _keyFile: object|null|undefined;
    _certificatePassword: string|null|undefined;
    _keyPassword: string|null|undefined;
    _certificateHasPassword: boolean|null|undefined;
    _keyHasPassword: boolean|null|undefined;
    constructor();
    render(): any;
    _importTypeHandler(e: any): void;
    _importTypeClickHandler(e: any): void;
    cancel(): void;
    accept(): any;

    /**
     * istanbul ignore next
     */
    _selectCertFileHandler(): void;

    /**
     * istanbul ignore next
     */
    _selectKeyFileHandler(): void;
    _certFileHandler(e: any): void;
    _keyFileHandler(e: any): void;
    _clearCertHandler(): void;
    _clearKeyHandler(): void;
    _certPassChangeHandler(e: any): void;
    _keyPassChangeHandler(e: any): void;
    _inputHandler(e: any): void;
    _importHandler(): void;
    getConfig(): any;
    fileToBuffer(blob: any): any;
    fileToString(blob: any): any;
    _headerTemplate(): any;
    _certTypeButton(type: any, ico: any, label: any, desc: any): any;
    _startScreenTemplate(): any;
    _certificateInput(): any;
    _certificateInfoTemplate(file: any): any;
    _passwordFiledTemplate(name: any, label: any): any;
    _keyInfoTemplate(file: any): any;
    _keyInput(): any;
    _certPasswordTemplate(): any;
    _keyTemplate(): any;
    _filesFormTemplate(): any;
  }
}
