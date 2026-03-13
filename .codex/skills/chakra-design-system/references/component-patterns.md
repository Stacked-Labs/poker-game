# Chakra component patterns (repo-facing)

## General rules

- Keep components small; extract helpers when logic gets dense.
- Prefer typed props with `interface FooProps { ... }` (not `React.FC`).
- Match existing import style and Chakra composition patterns in nearby components.
- Use `'use client'` only when you need hooks, state, effects, or event handlers.

---

## Layout components

### Choosing the right container

| Need | Use |
|------|-----|
| Simple vertical/horizontal spacing | `VStack` / `HStack` / `Stack` |
| Flexbox alignment & justification | `Flex` |
| CSS Grid | `Grid` + `GridItem` |
| Generic container (padding, margin, bg) | `Box` |
| Constrained page width | `Container` |
| Two-column or complex layouts | `Grid` |

- **Prefer `VStack` / `HStack`** over `Flex` when all you need is spacing — it communicates intent.
- Use `Flex` only when you need `justify`, `align`, `wrap`, or `direction`.
- Avoid deep nesting: more than 3 levels of layout wrappers is a sign the component should be split.
- Use `gap` / `spacing` on Stack/Flex rather than adding margin to children.

```tsx
// Prefer
<VStack spacing={4} align="stretch">
  <Header />
  <Body />
</VStack>

// Over
<Box mb={4}><Header /></Box>
<Box><Body /></Box>
```

### Responsive props

Use array syntax (mobile-first) or object syntax:

```tsx
// Array (base → sm → md → lg → xl → 2xl)
<Box fontSize={['sm', null, 'md', 'lg']} px={[4, 6, 8]} />

// Object (more readable for large jumps)
<Box display={{ base: 'none', md: 'flex' }} />
```

Only use `sx` orientation queries when UI truly needs portrait vs landscape:

```tsx
sx={{ '@media (orientation: landscape)': { flexDirection: 'row' } }}
```

---

## Typography

```tsx
// Headings — use the Heading component (applies heading variant defaults)
<Heading as="h2" size="lg">Table Name</Heading>
<Heading as="h3" size="md" color="text.secondary">Blinds</Heading>

// Body text
<Text color="text.primary">Primary body</Text>
<Text variant="secondary">Subdued text</Text>  // uses text.secondary token

// Truncation
<Text noOfLines={2}>Long description that truncates...</Text>
```

Available text variants in this repo: `secondary`, `seatText`, `statSubHead`, `statBody`.

---

## Buttons

### Use theme variants — never invent inline button styles

| Variant | When to use |
|---------|-------------|
| `greenGradient` | Primary CTA (Join table, Submit, Confirm) |
| `outlineSuccess` | Secondary confirm action |
| `outlineMuted` | Neutral secondary action |
| `base` | Generic dark background button |
| `raiseActionButton` | Poker action buttons (raise, call) |
| `social` | Social share / auth providers |
| `navLink` | Top navigation items |
| `homeNav` | Home page section navigation |
| `themeButton` | Transparent, hover → pink |
| `underlined` | In-line text link style |
| `emptySeat` | Clickable empty seat indicator |
| `gameSettingsButton` | Settings panel actions |

```tsx
// Good
<Button variant="greenGradient" size="lg" onClick={handleJoin}>
  Join Table
</Button>

// Bad — inline styles bypass the design system
<Button bg="green.400" _hover={{ bg: 'green.500' }} borderRadius="xl">
  Join Table
</Button>
```

Available sizes: `sm`, `md` (default), `lg`, `xl`, `2xl`, `3xl`, `4xl`.

- Always set `isLoading` + `loadingText` on async actions.
- Always set `isDisabled` when the action is not currently valid.
- `IconButton` **must** have `aria-label`.

```tsx
<IconButton
  aria-label="Close settings"
  icon={<CloseIcon />}
  variant="themeButton"
  size="sm"
  onClick={onClose}
/>
```

---

## Inputs & Forms

### FormControl structure

Always wrap inputs in `FormControl` for correct a11y linking:

```tsx
<FormControl isRequired isInvalid={!!errors.amount}>
  <FormLabel variant="createGame">Bet Amount</FormLabel>
  <Input
    variant="takeSeatModal"
    placeholder="Enter amount"
    {...register('amount')}
  />
  <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
</FormControl>
```

### Input variants

| Variant | When to use |
|---------|-------------|
| `white` | Light surface inputs (modals with white bg) |
| `takeSeatModal` | Primary modal inputs (56px height, themed focus) |
| `settings` | Settings panel fields |
| `outlined` | Dark background inputs |

- Use React Hook Form (`useForm`, `register`, `handleSubmit`) for any form with >2 fields.
- Pair with Zod for schema validation: `zodResolver(schema)`.
- Use `mode: 'onBlur'` for field-level feedback; default to `onSubmit` for simple forms.
- Never use only `placeholder` as the label — always provide a visible `FormLabel`.

---

## Modals & Drawers

```tsx
const { isOpen, onOpen, onClose } = useDisclosure();

<Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
  <ModalOverlay backdropFilter="blur(4px)" />
  <ModalContent bg="bg.surface" borderRadius="xl">
    <ModalHeader color="text.primary">Title</ModalHeader>
    <ModalCloseButton />
    <ModalBody>...</ModalBody>
    <ModalFooter gap={3}>
      <Button variant="outlineMuted" onClick={onClose}>Cancel</Button>
      <Button variant="greenGradient" onClick={handleConfirm}>Confirm</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

- Use `backdropFilter="blur(4px)"` on overlays for the glassmorphism effect used in this repo.
- Focus is automatically managed by Chakra — `initialFocusRef` if a specific input should be focused.
- Always include a close mechanism: `ModalCloseButton` or an explicit cancel button.

---

## Cards & Surfaces

Use semantic tokens for card backgrounds to get correct dark/light mode:

```tsx
// Standard card
<Box bg="card.white" borderRadius="xl" p={6} boxShadow="default">
  ...
</Box>

// Dark navy card
<Box bg="card.darkNavy" borderRadius="xl" p={6}>
  ...
</Box>

// Hero/feature card
<Box bg="card.heroBg" borderRadius="2xl" p={8} boxShadow="card.hero">
  ...
</Box>
```

Available shadows: `default`, `glass`, `glass-hover`, `glass-active`, `glow-green`, `glow-pink`, `glow-yellow`, `btn-premium`, `btn-premium-hover`.

---

## Dark mode patterns

### Component-level overrides (preferred for one-off changes)

```tsx
// _dark pseudo-prop
<Text color="gray.700" _dark={{ color: 'gray.200' }}>Label</Text>

// useColorModeValue hook
const bg = useColorModeValue('white', 'charcoal.800');
<Box bg={bg} />
```

### Semantic tokens (for systemic colors)

```tsx
// These adapt automatically — no _dark needed
<Box bg="bg.surface" color="text.primary" />
<Input borderColor="border.lightGray" />
```

**NEVER** modify a shared semantic token in `theme.ts` for a single-component change. Tokens are app-wide.

---

## Animations & Motion

```tsx
import { useReducedMotion } from 'framer-motion';

function AnimatedChip() {
  const prefersReduced = useReducedMotion();

  return (
    <Box
      transition={prefersReduced ? 'none' : 'all 0.2s ease'}
      _hover={prefersReduced ? {} : { transform: 'scale(1.05)' }}
    >
      ...
    </Box>
  );
}
```

- Default to subtle transitions (0.15–0.2s ease).
- Use `transform` + `opacity` for smooth GPU-composited animations — avoid animating `width`, `height`, `top`, `left`.
- Avoid long/complex animations during gameplay (distracting).
- Use `glow-green`, `glow-pink`, `glow-yellow` shadows for state highlights (winning hand, selected seat).

---

## Toasts

Use the repo's toast helper, not `useToast` directly:

```tsx
import { useToastHelper } from '@/hooks/useToastHelper';

const toast = useToastHelper();

toast.success('Seat joined!');
toast.error('Transaction failed. Try again.');
```

- Keep messages actionable: "what happened" + "what to do next".
- Use `success` for confirmations, `error` for failures, `info` for neutral updates.
- Avoid `warning` for poker actions — prefer clear error or info.

---

## Badges & Tags

```tsx
// Status badge
<Badge colorScheme="green" variant="subtle">Active</Badge>
<Badge colorScheme="red" variant="subtle">Folded</Badge>

// Chip count
<Badge bg="brand.yellow" color="brand.darkNavy" fontWeight="bold" px={2}>
  {chipCount.toLocaleString()}
</Badge>
```

---

## Loading states

```tsx
// Inline spinner
<Spinner size="sm" color="brand.green" />

// Skeleton (preferred for layout-preserving loading)
<Skeleton height="40px" borderRadius="md" />
<SkeletonText noOfLines={3} spacing={2} />

// Full-page or section overlay
<Box position="relative">
  {isLoading && (
    <Center position="absolute" inset={0} bg="blackAlpha.600" zIndex={1}>
      <Spinner color="brand.green" size="xl" />
    </Center>
  )}
  <Content />
</Box>
```

Prefer `Skeleton` over spinner for content areas — it reduces layout shift and feels faster.

---

## Common mistakes to avoid

- **Don't use `<div>` when a Chakra layout component exists** — always prefer `Box`, `Flex`, `Stack`.
- **Don't hardcode colors** — use semantic tokens or `brand.*` colors.
- **Don't skip `FormControl` wrapper** — inputs without it lose a11y linking.
- **Don't set styles on `<Button>` children** — style the button itself.
- **Don't nest `VStack` inside `VStack` when `Stack` with `divider` would work**.
- **Don't use `position: absolute` for overlays when Chakra's `Portal` + `Overlay` exist**.
- **Don't forget `isLoading` state on form submit buttons** — double submissions cause poker game bugs.
