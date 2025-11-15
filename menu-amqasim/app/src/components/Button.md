# Button Component

The `Button` component is a reusable and customizable UI element for triggering actions. It supports multiple variants, sizes, icons, and loading states.

## Props

### `variant` (optional)

-  **Type**: `"primary" | "secondary" | "outline" | "ghost" | "danger"`
-  **Default**: `"primary"`
-  **Description**: Specifies the style of the button. Each variant has a unique color scheme.

### `size` (optional)

-  **Type**: `"sm" | "md" | "lg"`
-  **Default**: `"md"`
-  **Description**: Determines the size of the button.

### `loading` (optional)

-  **Type**: `boolean`
-  **Default**: `false`
-  **Description**: Displays a loading spinner when set to `true`.

### `icon` (optional)

-  **Type**: `LucideIcon`
-  **Description**: Adds an icon to the button. The icon size adjusts based on the `size` prop.

### `rounded` (optional)

-  **Type**: `boolean`
-  **Default**: `false`
-  **Description**: Makes the button fully rounded when set to `true`.

### `children`

-  **Type**: `React.ReactNode`
-  **Description**: The content of the button, typically text or other elements.

### `className` (optional)

-  **Type**: `string`
-  **Default**: `""`
-  **Description**: Additional CSS classes to customize the button's appearance.

### `disabled` (optional)

-  **Type**: `boolean`
-  **Default**: `false`
-  **Description**: Disables the button when set to `true`.

## Variants

The `Button` component supports the following variants:

1. **Primary**: Default styling with utility color.
2. **Secondary**: Subtle styling with a mix of background and utility color.
3. **Outline**: Transparent background with a utility color border.
4. **Ghost**: Minimal styling with hover effects.
5. **Danger**: Red styling for destructive actions.

## Sizes

The `Button` component supports the following sizes:

1. **Small (`sm`)**: Compact size for smaller UI elements.
2. **Medium (`md`)**: Default size for general use.
3. **Large (`lg`)**: Larger size for prominent actions.

## Example Usage

### Basic Button

```tsx
<Button>Click Me</Button>
```

### Button with Icon

```tsx
<Button icon={User}>Profile</Button>
```

### Loading Button

```tsx
<Button loading>Loading...</Button>
```

### Rounded Button

```tsx
<Button rounded>Rounded</Button>
```

### Custom Styled Button

```tsx
<Button className="custom-class">Custom</Button>
```

## Accessibility

-  The `Button` component uses semantic `<button>` elements for accessibility.
-  Disabled buttons include `disabled` attributes to prevent interaction.

## Styling

The `Button` component uses Tailwind CSS for styling. It supports additional customization through the `className` prop.

## Decorative Elements

-  **Shimmer Effect**: For `primary` and `danger` variants, a subtle shimmer effect is added on hover.
-  **Dot Pattern Overlay**: Adds a radial gradient pattern for visual appeal.

## Notes

-  Ensure that the `loading` prop is used for asynchronous actions to indicate progress.
-  Use the `icon` prop to add visual cues to the button.

## Component File

The `Button` component is implemented in `Button.tsx`. Make sure to import it correctly in your project:

```tsx
import Button from "@/components/Button";
```
