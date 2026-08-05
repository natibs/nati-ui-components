import { Renderer2 } from '@angular/core';

export function createWrapper(
  renderer: Renderer2,
  hostEl: HTMLElement,
  width: string | null,
): HTMLElement | null {
  const parent = renderer.parentNode(hostEl);
  if (!parent) return null;

  const wrapper = renderer.createElement('div');
  renderer.addClass(wrapper, 'natiUiField');
  if (width) {
    renderer.setStyle(wrapper, 'width', width);
    renderer.setStyle(hostEl, 'width', width);
  }
  renderer.insertBefore(parent, wrapper, hostEl);
  return wrapper;
}

export function createLabelElement(
  renderer: Renderer2,
  labelText: string,
  forId: string | null,
  required: boolean,
): HTMLElement {
  const label = renderer.createElement('label');
  renderer.addClass(label, 'natiUiFieldLabel');
  if (forId) {
    renderer.setAttribute(label, 'for', forId);
  }
  renderer.appendChild(label, renderer.createText(labelText));

  if (required) {
    const asterisk = renderer.createElement('span');
    renderer.addClass(asterisk, 'natiUiFieldRequiredMark');
    renderer.setAttribute(asterisk, 'aria-hidden', 'true');
    renderer.appendChild(asterisk, renderer.createText(' *'));
    renderer.appendChild(label, asterisk);
  }
  return label;
}

export function createErrorElement(
  renderer: Renderer2,
  id: string | null,
): HTMLElement {
  const error = renderer.createElement('p');
  renderer.addClass(error, 'natiUiFieldError');
  renderer.setAttribute(error, 'role', 'alert');
  if (id) {
    renderer.setAttribute(error, 'id', id);
  }
  return error;
}

export function setErrorText(
  renderer: Renderer2,
  errorEl: HTMLElement,
  message: string | null,
): void {
  renderer.setProperty(errorEl, 'textContent', message ?? '');
  renderer.setStyle(errorEl, 'display', message ? 'block' : 'none');
}
