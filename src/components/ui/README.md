# UI Component Library

This directory contains reusable UI components for the FIAT Dashboard application.

## Loading Components

### `LoadingSpinner`

A flexible loading spinner component with consistent styling across the application.

```tsx
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Full-screen loading
<LoadingSpinner fullScreen />

// Inline loading with text
<LoadingSpinner text="Processing..." />

// Custom size
<LoadingSpinner size={24} />

// No text (icon only)
<LoadingSpinner text="" />
```

#### Props

- `size?: number` - Size of the spinner (default: 30)
- `color?: string` - Color of the spinner (default: "#30c0f9")
- `className?: string` - Additional CSS classes
- `text?: string` - Text to display next to spinner (default: "Loading...")
- `fullScreen?: boolean` - Whether to display as a full-screen overlay (default: false)

### Enhanced Button with Loading State

The Button component has built-in loading state functionality:

```tsx
import { Button } from '../components/ui/button';

// Button with loading state
<Button 
  isLoading={isLoading} 
  loadingText="Saving..." 
  onClick={handleSave}
>
  Save
</Button>
```

#### Additional Props

- `isLoading?: boolean` - Whether the button is in loading state
- `loadingText?: string` - Text to display while loading (defaults to children)

## Usage Guidelines

1. For page-level loading indicators, use `<LoadingSpinner fullScreen />` or the `<LoadingScreen />` component
2. For button loading states, use the enhanced Button component with `isLoading` prop
3. For inline loading indicators within components, use `<LoadingSpinner />` with appropriate size 