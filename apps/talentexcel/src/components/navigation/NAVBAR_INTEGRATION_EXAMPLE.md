# Professional Navbar Integration Example

This example shows how the professional navbar is integrated in the TalentExcel app.

## Key Features

1. **Multi-level dropdown menus** - Support for nested navigation items
2. **Multi-column dropdowns** - Can display menu items in multiple columns
3. **User profile dropdown** - Shows user avatar, settings, theme toggle, and sign out
4. **Responsive mobile menu** - Fully functional mobile navigation
5. **Search and notifications** - Optional features that can be enabled
6. **Customizable branding** - Logo, name, and tagline support

## Example Configuration

```typescript
const navConfig: NavConfig = {
  brand: {
    name: 'AppName',
    logo: IconComponent,
    href: '/',
    tagline: 'Optional tagline'
  },
  items: [
    {
      label: 'Programs',
      icon: Award,
      children: [
        {
          label: 'Internships',
          href: '/internships',
          icon: Briefcase,
          description: 'Gain real-world experience',
          featured: true
        },
        // More child items...
      ]
    },
    {
      label: 'Resources',
      icon: Library,
      columns: 2, // Multi-column dropdown
      children: [
        // Items displayed in 2 columns
      ]
    }
  ],
  actions: <ThemeToggle />, // Custom actions
  sticky: true // Sticky navbar
}
```

## Usage

```typescript
<Navbar
  config={navConfig}
  user={currentUser}
  onSignIn={handleSignIn}
  onSignOut={handleSignOut}
  showSearch={true}
  showNotifications={true}
  notificationCount={3}
/>
```

## To Use in Other Apps

1. Copy the navigation folder to your app's components directory
2. Update import paths as needed
3. Create your own NavConfig
4. Wrap with NavigationWrapper for proper Next.js routing
5. Customize styling with Tailwind classes

The navbar automatically handles:
- Keyboard navigation
- ARIA accessibility
- Mobile responsiveness
- Theme integration
- Smooth animations