import { css } from 'lit-element';

export default css`:host {
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

anypoint-switch[compatibility] {
  margin-top: 12px;
  margin-bottom: 12px;
}`;
