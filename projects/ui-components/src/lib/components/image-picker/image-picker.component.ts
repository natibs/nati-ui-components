import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { NatiUiButtonDirective } from '../../directives/button/button.directive';
import { NatiUiImagePickerOutputType, NatiUiImagePickerShape } from './image-picker.interfaces';
import { clamp, coverScale, cropToDataUrl, loadImage, maxOffset, readFileAsDataUrl } from './image-picker.util';

@Component({
  selector: 'nati-ui-image-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'natiUiImagePickerHost' },
  imports: [NatiUiButtonDirective],
  template: `
    <div class="natiUiImagePicker">
      @if (!sourceImage()) {
        <div
          class="natiUiImagePickerAvatar"
          [class.natiUiImagePickerAvatarSquare]="shape() === 'square'"
          [style.width.px]="viewportSize()"
          [style.height.px]="viewportSize()"
        >
          @if (value()) {
            <img [src]="value()" alt="" />
          } @else {
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z"
                fill="currentColor"
              />
            </svg>
          }
        </div>

        <input
          #fileInput
          type="file"
          accept="image/*"
          class="natiUiImagePickerHiddenInput"
          (change)="onFileSelected($event)"
        />

        <div class="natiUiImagePickerActions">
          <button type="button" natiUiButton variant="outline" size="sm" (click)="fileInput.click()">
            {{ value() ? changeLabel() : addLabel() }}
          </button>
          @if (value()) {
            <button type="button" natiUiButton variant="ghost" size="sm" (click)="clear()">Remove</button>
          }
        </div>
      } @else {
        <div
          class="natiUiImagePickerViewport"
          [class.natiUiImagePickerViewportSquare]="shape() === 'square'"
          [style.width.px]="viewportSize()"
          [style.height.px]="viewportSize()"
          (pointerdown)="onPointerDown($event)"
          (pointermove)="onPointerMove($event)"
          (pointerup)="onPointerUp()"
          (pointercancel)="onPointerUp()"
        >
          <img
            [src]="sourceImage()!.src"
            alt=""
            class="natiUiImagePickerDragImage"
            [style.left.px]="imageLeft()"
            [style.top.px]="imageTop()"
            [style.width.px]="renderedWidth()"
            [style.height.px]="renderedHeight()"
            draggable="false"
          />
        </div>

        <input
          type="range"
          class="natiUiImagePickerZoom"
          min="1"
          [max]="maxZoom()"
          step="0.01"
          [value]="zoom()"
          (input)="onZoomChange($event)"
          aria-label="Zoom"
        />

        <div class="natiUiImagePickerActions">
          <button type="button" natiUiButton variant="ghost" size="sm" (click)="cancel()">Cancel</button>
          <button type="button" natiUiButton variant="primary" size="sm" (click)="confirm()">Use photo</button>
        </div>
      }

      @if (error()) {
        <p class="natiUiFieldError" role="alert">{{ error() }}</p>
      }
    </div>
  `,
})
export class NatiUiImagePickerComponent {
  value = model<string | null>(null);

  shape = input<NatiUiImagePickerShape>('circle');
  viewportSize = input(200);
  outputSize = input(320);
  maxZoom = input(3);
  maxFileSizeBytes = input(2 * 1024 * 1024);
  outputType = input<NatiUiImagePickerOutputType>('image/png');
  quality = input(0.92);
  addLabel = input('Add a photo');
  changeLabel = input('Change photo');

  protected readonly error = signal<string | null>(null);
  protected readonly sourceImage = signal<HTMLImageElement | null>(null);
  protected readonly zoom = signal(1);
  protected readonly offsetX = signal(0);
  protected readonly offsetY = signal(0);

  private readonly baseScale = computed(() => {
    const image = this.sourceImage();
    return image ? coverScale(image.naturalWidth, image.naturalHeight, this.viewportSize()) : 1;
  });
  protected readonly effectiveScale = computed(() => this.baseScale() * this.zoom());
  protected readonly renderedWidth = computed(
    () => (this.sourceImage()?.naturalWidth ?? 0) * this.effectiveScale(),
  );
  protected readonly renderedHeight = computed(
    () => (this.sourceImage()?.naturalHeight ?? 0) * this.effectiveScale(),
  );
  protected readonly imageLeft = computed(
    () => this.viewportSize() / 2 - this.renderedWidth() / 2 + this.offsetX(),
  );
  protected readonly imageTop = computed(
    () => this.viewportSize() / 2 - this.renderedHeight() / 2 + this.offsetY(),
  );

  private dragStart: { x: number; y: number; offsetX: number; offsetY: number } | null = null;

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    this.error.set(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Please choose an image file.');
      return;
    }
    if (file.size > this.maxFileSizeBytes()) {
      this.error.set(`Image must be smaller than ${Math.round(this.maxFileSizeBytes() / (1024 * 1024))} MB.`);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const image = await loadImage(dataUrl);
      this.sourceImage.set(image);
      this.zoom.set(1);
      this.offsetX.set(0);
      this.offsetY.set(0);
    } catch {
      this.error.set('Could not read that image.');
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.dragStart = { x: event.clientX, y: event.clientY, offsetX: this.offsetX(), offsetY: this.offsetY() };
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragStart) return;
    this.setOffset(
      this.dragStart.offsetX + (event.clientX - this.dragStart.x),
      this.dragStart.offsetY + (event.clientY - this.dragStart.y),
    );
  }

  protected onPointerUp(): void {
    this.dragStart = null;
  }

  protected onZoomChange(event: Event): void {
    this.zoom.set(Number((event.target as HTMLInputElement).value));
    this.setOffset(this.offsetX(), this.offsetY());
  }

  protected confirm(): void {
    const image = this.sourceImage();
    if (!image) return;

    this.value.set(
      cropToDataUrl(
        image,
        { scale: this.effectiveScale(), offsetX: this.offsetX(), offsetY: this.offsetY() },
        this.viewportSize(),
        this.outputSize(),
        this.shape(),
        this.outputType(),
        this.quality(),
      ),
    );
    this.sourceImage.set(null);
  }

  protected cancel(): void {
    this.sourceImage.set(null);
    this.error.set(null);
  }

  protected clear(): void {
    this.value.set(null);
    this.error.set(null);
  }

  private setOffset(x: number, y: number): void {
    const maxX = maxOffset(this.renderedWidth(), this.viewportSize());
    const maxY = maxOffset(this.renderedHeight(), this.viewportSize());
    this.offsetX.set(clamp(x, -maxX, maxX));
    this.offsetY.set(clamp(y, -maxY, maxY));
  }
}
