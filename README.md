# nati-ui-components

A small Angular component foundation, built to be dropped into any of my
projects and extended as it grows. It's written against Angular 22, uses
signal-based inputs throughout, and ships a Storybook so every component
can be developed and reviewed in isolation.

Live docs: run `npm run storybook` and open `http://localhost:6006`.

## What's in it

Directives (styled attribute selectors on native elements — apply them to
whatever markup you already have):

- `natiUiInput` — `input[natiUiInput]`, with label, inline validation error,
  size, and full `NgControl`/reactive-forms integration.
- `natiUiTextarea` — `textarea[natiUiTextarea]`, same conventions as
  `natiUiInput`, plus an `autoResize` option.
- `natiUiButton` — `button[natiUiButton]` / `a[natiUiButton]`, five variants
  (`primary`, `secondary`, `outline`, `danger`, `ghost`), three sizes, and
  a built-in loading spinner.
- `natiUiHeading` — `h1[natiUiHeading]` through `h6[natiUiHeading]`, applies
  the typography scale and lets the visual size be overridden independently
  of the semantic tag.

Components (bring their own template/markup):

- `<nati-ui-checkbox>` — labelled checkbox, `ControlValueAccessor`, supports
  indeterminate state and an optional description line.
- `<nati-ui-radio-group>` / `<nati-ui-radio>` — a `ControlValueAccessor`
  group and its items; children resolve the group via constructor
  injection, the same pattern Angular CDK uses for compound components.
- `<nati-ui-error-message>` — standalone inline/banner error message for
  cases with no single control to attach an error to (the form
  directives/components above already render their own inline errors).
- `<nati-ui-modal>` — a modal built on the native `<dialog>` element. Opens
  and closes through the browser's own `showModal()` / `close()` APIs
  (via the component's `open()` / `close()` methods) and light-dismisses
  via the `closedby="any"` attribute — no custom focus trap, no backdrop
  `<div>`, no `display: none` toggling.

## Styling

Plain SCSS with CSS custom properties
(`projects/ui-components/styles.scss` and `styles/tokens.scss`) — no
Tailwind or other build-time CSS framework required in consuming apps.
CSS classes are camelCase (`natiUiBtn`, `natiUiModalPanel`, ...) rather than
kebab-case/BEM. Re-theme the whole library by overriding the
`--nati-ui-*` custom properties on `:root`, or flip into dark mode by
adding `data-theme="dark"` to `<html>` (see `styles/tokens.scss`).

### Color palette

Every color is a full 50–900 tint/shade ramp, generated from three source
colors and anchored at `500`:

| Family    | 500 (source) | Used for                                   |
| --------- | ------------- | ------------------------------------------- |
| `basic`   | `#004777`     | primary actions, focus rings, checkbox/radio accent |
| `danger`  | `#E75A7C`     | destructive actions, validation errors      |
| `trinary` | `#F2F5EA`     | secondary button surface                    |

e.g. `var(--nati-ui-color-basic-500)`, `var(--nati-ui-color-danger-700)`,
`var(--nati-ui-color-trinary-100)`.

## Using it in another project

This is a standard Angular CLI workspace with a publishable library
(`ng-packagr`) at `projects/ui-components`. To use it elsewhere:

```bash
ng build ui-components
```

Then either `npm pack`/`npm publish` the contents of `dist/ui-components`,
or point another project's `package.json` at this repo
(`"ui-components": "file:../ui-components/dist/ui-components"`, or a Git
URL). Import components/directives from `'ui-components'`, and add the
stylesheet once in your app's global styles:

```ts
import { NatiUiInputDirective, NatiUiModalComponent } from 'ui-components';
```

```scss
// styles.scss
@use 'ui-components/styles';
```

## Local development

```bash
npm install
npm run storybook        # component playground at localhost:6006
npm start                # serves the "showcase" demo app at localhost:4200
npm run build:lib        # builds the publishable library to dist/ui-components
npm run build-storybook  # static Storybook build to dist/storybook (deployable, e.g. to GitHub Pages)
```

The `showcase` app under `projects/showcase` exists mainly to host
Storybook's dev server (Storybook-for-Angular needs a real application
build target to compile against), but it also renders a small demo page
of its own at `npm start`, including a light/dark theme toggle.

## Design decisions worth knowing

- **Attribute directives over wrapper components** for input/textarea/
  button/heading, so they compose with markup you already have
  (`routerLink`, `type="submit"`, existing `formControlName`, etc.)
  instead of requiring you to swap tags.
- **Signals everywhere** — every `@Input` is a signal-based `input()`,
  state is `signal()`/`computed()`, and DOM updates run inside
  `effect()`. No `ChangeDetectorRef.markForCheck()` calls.
- **Shared form-control helpers** (`src/lib/utils/control-error.util.ts`)
  centralise the "is this control invalid and has the user interacted
  with it" and "what message should I show" logic, so `natiUiInput`,
  `natiUiTextarea`, `nati-ui-checkbox`, and `nati-ui-radio-group` all
  behave consistently instead of re-implementing it four times.
- **No UI/animation dependencies.** No icon library, no CDK overlay, no
  `@angular/animations` in the published library — the loading spinner
  and modal transitions are plain CSS. Keeps the package small and easy
  to drop into any project without pulling in someone else's design
  system.

## Roadmap ideas

This is deliberately a foundation, not a complete kit. Natural next
components: select/combobox, date picker, toast/notification, tabs,
tooltip, and an accessibility pass with `axe-playwright` or
`test-storybook`'s a11y addon wired into CI.
