# Field Component

The `Field` component is a reusable and customizable input field for forms. It supports various styles, sizes, icons, and validation states.

## Props

### `label` (optional)

-  **Type**: `string`
-  **Description**: The label text displayed above the input field.

### `error` (optional)

-  **Type**: `string`
-  **Description**: The error message displayed below the input field. If provided, the field will be styled to indicate an error state.

### `hint` (optional)

-  **Type**: `string`
-  **Description**: A hint message displayed below the input field.

### `icon` (optional)

-  **Type**: `"mail" | "lock" | "user" | "search" | "phone" | "calendar" | "globe" | "credit-card" | "map-pin" | "building"`
-  **Description**: Adds an icon inside the input field. The icon is placed on the left side.

### `variant` (optional)

-  **Type**: `"default" | "filled"`
-  **Default**: `"default"`
-  **Description**: Specifies the style of the input field.

### `size` (optional)

-  **Type**: `"sm" | "md" | "lg"`
-  **Default**: `"md"`
-  **Description**: Determines the size of the input field.

### `rounded` (optional)

-  **Type**: `boolean`
-  **Default**: `false`
-  **Description**: Makes the input field fully rounded when set to `true`.

### `type` (optional)

-  **Type**: `string`
-  **Default**: `"text"`
-  **Description**: Specifies the type of the input field (e.g., `"text"`, `"password"`, `"email"`).

### `className` (optional)

-  **Type**: `string`
-  **Default**: `""`
-  **Description**: Additional CSS classes to customize the field's appearance.

### `disabled` (optional)

-  **Type**: `boolean`
-  **Default**: `false`
-  **Description**: Disables the input field when set to `true`.

### `id` (optional)

-  **Type**: `string`
-  **Description**: The `id` attribute for the input field.

## Example Usage

### Basic Field

```tsx
<Field label="Username" placeholder="Enter your username" />
```

### Field with Icon

```tsx
<Field label="Email" icon="mail" placeholder="Enter your email" />
```

### Password Field with Toggle

```tsx
<Field
   label="Password"
   type="password"
   icon="lock"
   placeholder="Enter your password"
/>
```

### Field with Error Message

```tsx
<Field
   label="Username"
   error="This field is required."
   placeholder="Enter your username"
/>
```

### Rounded Field

```tsx
<Field label="Search" icon="search" rounded placeholder="Search..." />
```

## Accessibility

-  The `Field` component uses semantic `<input>` elements for accessibility.
-  Labels are associated with input fields using the `id` attribute.

## Styling

The `Field` component uses Tailwind CSS for styling. It supports additional customization through the `className` prop.

## Notes

-  Ensure that the `error` prop is used to indicate validation errors.
-  Use the `icon` prop to add visual cues to the input field.

## Component File

The `Field` component is implemented in `Field.tsx`. Make sure to import it correctly in your project:

```tsx
import Field from "@/components/Field";
```
