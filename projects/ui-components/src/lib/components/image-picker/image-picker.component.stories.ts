import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NatiUiImagePickerComponent } from './image-picker.component';

const meta: Meta<NatiUiImagePickerComponent> = {
  component: NatiUiImagePickerComponent,
  title: 'Components/ImagePicker',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [NatiUiImagePickerComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          'Selects an image file, then crops it with a pan/zoom viewport before resizing it to a fixed output resolution on an offscreen canvas. `value` is a two-way-bindable data-URL string. No external cropper dependency — pan/zoom/crop/resize are all done with native Pointer Events and Canvas 2D.',
      },
    },
  },
  argTypes: {
    shape: { control: 'radio', options: ['circle', 'square'] },
  },
  args: {
    shape: 'circle',
    viewportSize: 200,
    outputSize: 320,
    maxZoom: 3,
  },
};
export default meta;

type Story = StoryObj<NatiUiImagePickerComponent>;

export const Default: Story = {};

export const Square: Story = {
  args: { shape: 'square' },
};

export const SmallOutput: Story = {
  args: { viewportSize: 140, outputSize: 96 },
};
