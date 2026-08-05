import { Directive, ElementRef, inject, input } from '@angular/core';

export type NatiUiHeadingSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

@Directive({
  selector:
    'h1[natiUiHeading], h2[natiUiHeading], h3[natiUiHeading], h4[natiUiHeading], h5[natiUiHeading], h6[natiUiHeading]',
  host: {
    class: 'natiUiHeading',
    '[class]': 'sizeClass()',
  },
})
export class NatiUiHeadingDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  size = input<NatiUiHeadingSize | null>(null);

  protected sizeClass(): string {
    const tag = this.elementRef.nativeElement.tagName.toLowerCase() as NatiUiHeadingSize;
    const level = this.size() ?? tag;
    return `natiUiHeading${level.toUpperCase()}`;
  }
}
