# Alert Component

The `Alert` component is a versatile and customizable UI element used to display messages to users. It supports multiple variants, icons, and a close button for dismissing the alert.

## Props

### `variant` (optional)

-  **Type**: `"default" | "success" | "error" | "info" | "warning"`
-  **Default**: `"default"`
-  **Description**: Specifies the style of the alert. Each variant has a unique color scheme and icon.

### `title` (optional)

-  **Type**: `string`
-  **Description**: The title of the alert, displayed prominently at the top.

### `children`

-  **Type**: `React.ReactNode`
-  **Description**: The main content of the alert, typically used for the message text.

### `onClose` (optional)

-  **Type**: `() => void`
-  **Description**: Callback function triggered when the close button is clicked. If not provided, the close button will not be rendered.

### `showIcon` (optional)

-  **Type**: `boolean`
-  **Default**: `true`
-  **Description**: Determines whether the variant-specific icon is displayed.

### `className` (optional)

-  **Type**: `string`
-  **Default**: `""`
-  **Description**: Additional CSS classes to customize the alert's appearance.

## Variants

The `Alert` component supports the following variants:

1. **Default**: Neutral styling with utility color.
2. **Success**: Green styling for success messages.
3. **Error**: Red styling for error messages.
4. **Info**: Blue styling for informational messages.
5. **Warning**: Yellow styling for warning messages.

Each variant includes:

-  A unique background, border, and text color.
-  A variant-specific icon.

## Example Usage

### Basic Alert

```tsx
<Alert title="Default Alert">This is a default alert.</Alert>
```

### Success Alert with Close Button

```tsx
<Alert
   variant="success"
   title="Success!"
   onClose={() => console.log("Alert closed")}
>
   Your operation was successful.
</Alert>
```

### Error Alert without Icon

```tsx
<Alert variant="error" title="Error!" showIcon={false}>
   Something went wrong.
</Alert>
```

### Custom Styled Alert

```tsx
<Alert variant="info" title="Information" className="custom-alert-class">
   This is an informational alert with custom styles.
</Alert>
```

## Accessibility

-  The `Alert` component uses the `role="alert"` attribute to ensure it is accessible to screen readers.
-  The close button includes `aria-label="Close alert"` for better accessibility.

## Styling

The `Alert` component uses Tailwind CSS for styling. It supports additional customization through the `className` prop.

## Decorative Elements

-  **Background Pattern**: A subtle radial gradient pattern for visual appeal.
-  **Shimmer Effect**: A moving gradient overlay for a modern look.
-  **Decorative Blurs**: Soft blurred circles for added depth.

## Notes

-  Ensure that the `onClose` prop is provided if you want the alert to be dismissible.
-  Use the `showIcon` prop to hide the icon if not needed.

## Component File

The `Alert` component is implemented in `Alert.tsx`. Make sure to import it correctly in your project:

```tsx
import Alert from "@/components/Alert";
```
