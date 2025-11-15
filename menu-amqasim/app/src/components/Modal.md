# Modal Component

The `Modal` component is a reusable and customizable dialog box for displaying content in an overlay. It supports various sizes, animations, and dismiss behaviors.

## Props

### `trigger`

-  **Type**: `React.ReactNode`
-  **Description**: The element that triggers the modal when clicked.

### `title` (optional)

-  **Type**: `string`
-  **Description**: The title of the modal, displayed at the top.

### `children`

-  **Type**: `React.ReactNode`
-  **Description**: The content of the modal.

### `size` (optional)

-  **Type**: `"sm" | "md" | "lg" | "xl"`
-  **Default**: `"md"`
-  **Description**: Determines the size of the modal.

### `showCloseButton` (optional)

-  **Type**: `boolean`
-  **Default**: `true`
-  **Description**: Determines whether the close button is displayed in the top-right corner.

### `closeOnBackdrop` (optional)

-  **Type**: `boolean`
-  **Default**: `true`
-  **Description**: Determines whether clicking on the backdrop dismisses the modal.

### `closeOnEscape` (optional)

-  **Type**: `boolean`
-  **Default**: `true`
-  **Description**: Determines whether pressing the `Escape` key dismisses the modal.

### `onDismiss` (optional)

-  **Type**: `() => void`
-  **Description**: Callback function triggered when the modal is dismissed.

## Example Usage

### Basic Modal

```tsx
<Modal trigger={<button>Open Modal</button>} title="Basic Modal">
   <p>This is a basic modal.</p>
</Modal>
```

### Modal with Custom Size

```tsx
<Modal
   trigger={<button>Open Large Modal</button>}
   title="Large Modal"
   size="lg"
>
   <p>This is a large modal.</p>
</Modal>
```

### Modal without Close Button

```tsx
<Modal
   trigger={<button>Open Modal</button>}
   title="No Close Button"
   showCloseButton={false}
>
   <p>This modal does not have a close button.</p>
</Modal>
```

### Modal with Dismiss Callbacks

```tsx
<Modal
   trigger={<button>Open Modal</button>}
   title="Dismiss Callback"
   onDismiss={() => console.log("Modal dismissed")}
>
   <p>This modal triggers a callback when dismissed.</p>
</Modal>
```

## Accessibility

-  The `Modal` component uses semantic HTML and ARIA roles to ensure accessibility.
-  The `Escape` key and backdrop clicks are supported for dismissing the modal.

## Styling

The `Modal` component uses Tailwind CSS for styling. It supports additional customization through the `className` prop.

## Notes

-  Ensure that the `trigger` prop is provided to open the modal.
-  Use the `onDismiss` prop to handle modal dismissal events.

## Component File

The `Modal` component is implemented in `Modal.tsx`. Make sure to import it correctly in your project:

```tsx
import Modal from "@/components/Modal";
```
