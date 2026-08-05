import { Component, OnDestroy, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NatiUiButtonDirective,
  NatiUiCheckboxComponent,
  NatiUiErrorMessageComponent,
  NatiUiHeadingDirective,
  NatiUiInputDirective,
  NatiUiModalComponent,
  NatiUiRadioComponent,
  NatiUiRadioGroupComponent,
  NatiUiTextareaDirective,
} from 'ui-components';

type Theme = 'light' | 'dark';
type ServerDemoStatus = 'loading' | 'done';

const THEME_STORAGE_KEY = 'nati-ui-theme';
const SERVER_DEMO_LATENCY_MS = 1800;
const SERVER_DEMO_CLOSE_DELAY_MS = 750;

function readInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    NatiUiInputDirective,
    NatiUiTextareaDirective,
    NatiUiButtonDirective,
    NatiUiHeadingDirective,
    NatiUiCheckboxComponent,
    NatiUiRadioGroupComponent,
    NatiUiRadioComponent,
    NatiUiErrorMessageComponent,
    NatiUiModalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  protected plan = 'pro';
  protected acceptedTerms = false;
  protected theme = signal<Theme>(readInitialTheme());

  protected serverDemoStatus = signal<ServerDemoStatus>('loading');
  protected serverDemoShowClose = signal(false);
  private serverResponded = false;
  private serverDemoTimers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.dataset['theme'] = theme;
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    });
  }

  protected toggleTheme(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  protected startServerDemo(): void {
    this.serverResponded = false;
    this.serverDemoStatus.set('loading');
    this.serverDemoShowClose.set(false);
    this.clearServerDemoTimers();
    this.serverDemoTimers.push(
      setTimeout(() => {
        this.serverResponded = true;
      }, SERVER_DEMO_LATENCY_MS),
    );
  }

  protected onSpinCycleEnd(): void {
    if (!this.serverResponded || this.serverDemoStatus() !== 'loading') return;
    this.serverDemoStatus.set('done');
    this.serverDemoTimers.push(
      setTimeout(() => this.serverDemoShowClose.set(true), SERVER_DEMO_CLOSE_DELAY_MS),
    );
  }

  protected clearServerDemoTimers(): void {
    this.serverDemoTimers.forEach(clearTimeout);
    this.serverDemoTimers = [];
  }

  ngOnDestroy(): void {
    this.clearServerDemoTimers();
  }
}
