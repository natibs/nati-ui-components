import { Injectable, signal } from '@angular/core';
import { NatiUiToast, NatiUiToastType } from './toast.interfaces';

const EXIT_DURATION = 180;

@Injectable({ providedIn: 'root' })
export class NatiUiToastService {
  private counter = 0;
  private readonly toastsSig = signal<NatiUiToast[]>([]);
  readonly toasts = this.toastsSig.asReadonly();
  readonly defaultDuration = 5000;

  show(message: string, type: NatiUiToastType = 'info', duration = this.defaultDuration): number {
    const id = ++this.counter;
    this.toastsSig.update((list) => [...list, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  success(message: string, duration = this.defaultDuration): number {
    return this.show(message, 'success', duration);
  }

  danger(message: string, duration = this.defaultDuration): number {
    return this.show(message, 'danger', duration);
  }

  warning(message: string, duration = this.defaultDuration): number {
    return this.show(message, 'warning', duration);
  }

  info(message: string, duration = this.defaultDuration): number {
    return this.show(message, 'info', duration);
  }

  dismiss(id: number): void {
    const current = this.toastsSig();
    if (!current.some((t) => t.id === id && !t.removing)) return;

    this.toastsSig.update((list) =>
      list.map((t) => (t.id === id ? { ...t, removing: true } : t)),
    );
    setTimeout(() => {
      this.toastsSig.update((list) => list.filter((t) => t.id !== id));
    }, EXIT_DURATION);
  }

  clear(): void {
    this.toastsSig.set([]);
  }
}
