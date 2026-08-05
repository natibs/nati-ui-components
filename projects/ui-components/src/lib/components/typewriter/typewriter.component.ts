import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  OnDestroy,
  signal,
  untracked,
} from '@angular/core';
import { NatiUiTypewriterText } from './typewriter.interfaces';

const TYPE_SPEED_MS = 70;
const DELETE_SPEED_MS = 35;
const DELETE_PAUSE_MS = 300;

@Component({
  selector: 'nati-ui-typewriter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'natiUiTypewriterHost' },
  template: `
    <span class="natiUiTypewriter" [style.font-size]="fontSize()" [style.color]="color()">
      <span class="natiUiTypewriterText">{{ displayText() }}</span>
      <span class="natiUiTypewriterCursor" aria-hidden="true"></span>
    </span>
  `,
})
export class NatiUiTypewriterComponent implements OnDestroy {
  text = input<NatiUiTypewriterText>('');
  pauseTime = input(2000);
  fontSize = input('1.5rem');
  color = input<string | null>(null);

  protected readonly displayText = signal('');

  private runId = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const value = this.text();
      untracked(() => this.start(value));
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private stop(): void {
    this.runId++;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private schedule(fn: () => void, delay: number, id: number): void {
    this.timer = setTimeout(() => {
      if (id !== this.runId) return;
      fn();
    }, delay);
  }

  private start(value: NatiUiTypewriterText): void {
    this.stop();
    const id = this.runId;
    this.displayText.set('');

    if (Array.isArray(value)) {
      const items = value.filter((v) => v.length > 0);
      if (items.length) this.loopWords(items, 0, id);
    } else if (value) {
      this.typeChars(value, id, 0);
    }
  }

  private typeChars(value: string, id: number, index: number, onDone?: () => void): void {
    this.displayText.set(value.slice(0, index));
    if (index >= value.length) {
      onDone?.();
      return;
    }
    this.schedule(() => this.typeChars(value, id, index + 1, onDone), TYPE_SPEED_MS, id);
  }

  private deleteChars(value: string, id: number, index: number, onDone: () => void): void {
    this.displayText.set(value.slice(0, index));
    if (index <= 0) {
      onDone();
      return;
    }
    this.schedule(() => this.deleteChars(value, id, index - 1, onDone), DELETE_SPEED_MS, id);
  }

  private loopWords(items: string[], wordIndex: number, id: number): void {
    const value = items[wordIndex % items.length];
    this.typeChars(value, id, 0, () => {
      this.schedule(
        () =>
          this.deleteChars(value, id, value.length, () => {
            this.schedule(() => this.loopWords(items, wordIndex + 1, id), DELETE_PAUSE_MS, id);
          }),
        this.pauseTime(),
        id,
      );
    });
  }
}
