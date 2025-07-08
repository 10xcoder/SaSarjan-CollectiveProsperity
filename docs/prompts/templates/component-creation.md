# Template - Component Creation

**Use this template when creating new React components**

---

## 🎯 **Component Creation Template**

### **PROMPT: Create [Component Name]**

```
Create a new React component called [ComponentName] with the following specifications:

1. **Component Structure**:
   - Location: /apps/[app-name]/src/components/[component-name].tsx
   - Use TypeScript with proper interface definitions
   - Follow existing component patterns in the codebase
   - Include proper JSDoc comments

2. **Props Interface**:
   - Define clear prop types with TypeScript
   - Include optional and required props
   - Add default values where appropriate
   - Consider component composition patterns

3. **Styling**:
   - Use Tailwind CSS classes
   - Support dark mode with dark: variants
   - Ensure mobile responsiveness
   - Follow design system colors and spacing

4. **Accessibility**:
   - Include proper ARIA labels and roles
   - Ensure keyboard navigation support
   - Add screen reader support
   - Follow WCAG 2.1 AA guidelines

5. **State Management**:
   - Use useState for local state
   - Consider useEffect for side effects
   - Implement proper cleanup if needed
   - Handle loading and error states

6. **Testing**:
   - Create test file: [component-name].test.tsx
   - Test all props and interactions
   - Include accessibility tests
   - Mock external dependencies

7. **Documentation**:
   - Add Storybook story if applicable
   - Include usage examples in comments
   - Document any complex logic
   - Add to component index file

Example prop interface:
```typescript
interface ComponentNameProps {
  // Required props
  title: string;
  onAction: (value: string) => void;
  
  // Optional props
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  
  // Children/composition
  children?: React.ReactNode;
}
```

Follow the existing component patterns and ensure consistency with the design system.
```

---

## 📋 **Checklist for Component Creation**

### **Before Creating**
- [ ] Check if similar component already exists
- [ ] Review existing component patterns
- [ ] Understand the design requirements
- [ ] Plan the component API (props)

### **During Creation**
- [ ] TypeScript interfaces defined
- [ ] Accessibility attributes included
- [ ] Mobile responsiveness considered
- [ ] Dark mode support added
- [ ] Error handling implemented

### **After Creation**
- [ ] Component renders without errors
- [ ] All props work as expected
- [ ] Accessibility tested with screen reader
- [ ] Mobile layout verified
- [ ] Tests written and passing
- [ ] Documentation updated

---

## 🎨 **Common Component Patterns**

### **Button Component Example**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
        },
        {
          'h-8 px-3 text-xs': size === 'sm',
          'h-10 px-4 py-2': size === 'md',
          'h-11 px-8': size === 'lg',
        },
        className
      )}
      aria-label={loading ? 'Loading...' : undefined}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
```

### **Input Component Example**
```typescript
interface InputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export function Input({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  required = false,
  error,
  className,
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium leading-none">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
          'text-sm ring-offset-background file:border-0 file:bg-transparent',
          'file:text-sm file:font-medium placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## 🧪 **Testing Template**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './component-name';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName title="Test" onAction={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles interactions', () => {
    const mockAction = jest.fn();
    render(<ComponentName title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalledWith('expected-value');
  });

  it('supports accessibility', () => {
    render(<ComponentName title="Test" onAction={() => {}} />);
    
    const element = screen.getByRole('button');
    expect(element).toHaveAttribute('aria-label');
    expect(element).toBeVisible();
  });

  it('handles disabled state', () => {
    render(<ComponentName title="Test" onAction={() => {}} disabled />);
    
    const element = screen.getByRole('button');
    expect(element).toBeDisabled();
  });
});
```

---

## 📁 **File Structure**

```
/apps/[app-name]/src/components/
├── component-name.tsx          # Main component
├── component-name.test.tsx     # Tests
├── component-name.stories.tsx  # Storybook (optional)
└── index.ts                    # Export file
```

---

## 🎨 **Styling Guidelines**

### **Tailwind Classes**
- Use semantic color names (`primary`, `secondary`, `destructive`)
- Implement dark mode with `dark:` prefix
- Use responsive prefixes (`sm:`, `md:`, `lg:`)
- Follow spacing scale (`p-4`, `m-2`, `gap-4`)

### **Component Variants**
```typescript
const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 py-2',
  lg: 'h-11 px-8',
};
```

---

## 🔄 **Component Lifecycle**

1. **Planning**: Define requirements and API
2. **Creation**: Build component with TypeScript
3. **Styling**: Apply Tailwind classes and variants
4. **Testing**: Write comprehensive tests
5. **Documentation**: Add comments and usage examples
6. **Integration**: Add to component library
7. **Review**: Code review and refinement

---

**💡 Remember: Good components are reusable, accessible, and well-tested! 🎯**