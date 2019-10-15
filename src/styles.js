import { css } from 'lit-element';
export default css`
:host {
  position: relative;
  font-size: var(--arc-font-body1-font-size);
  font-weight: var(--arc-font-body1-font-weight);
  line-height: var(--arc-font-body1-line-height);
  display: flex;
  flex-direction: column;
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

anypoint-listbox anypoint-icon-item {
  cursor: pointer;
}

[hidden] {
  display: none !important;
}

paper-progress {
  width: 100%;
}

.error-toast {
  background-color: var(--warning-primary-color, #FF7043);
  color: var(--warning-contrast-color, #fff);
}

#exportOptionsContainer,
#certificateDetailsContainer {
  width: var(--bottom-sheet-width, 100%);
  max-width: var(--bottom-sheet-max-width, 700px);
  right: var(--cookie-manager-bottom-sheet-right, 40px);
  left: var(--cookie-manager-bottom-sheet-left, auto);
}

cookies-list-items {
  flex: 1;
}

.add-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.empty-screen {
  fill: currentColor;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-image {
  width: 120px;
  display: block;
  margin-bottom: 40px;
}

.empty-title {
  font-size: 1.25rem;
}

.empty-info {
  margin-left: 16px;
  color: var(--empty-info-color, rgba(0, 0, 0, 0.74));
  font-size: var(--empty-info-font-size, 1rem);
  max-width: 400px;
  text-align: center;
}

.empty-add-cert {
  margin-top: 20px;
}

[disabled] .icon {
  color: #9b9b9b;
}

.cert-type-ico {
  color: var(--accent-color);
  text-transform: uppercase;
}
`;
