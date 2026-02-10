# Coding Standards

These guidelines apply to all projects to ensure clean, maintainable code that anyone can understand.

## Keep Things Organized (Separation of Concerns)

Each file and function should have one clear job - like having separate drawers for socks and shirts.

**In practice:**

- **React components** handle UI structure and user interaction
- **Tailwind classes** handle how things look (in the component file)
- **Utility functions** (`app/lib/`) handle business logic and data
- **Context providers** (`app/context/`) handle shared state
- Each function does one specific task with a clear name

**Example:**

```typescript
// Good - one function, one job
function calculateTotal(items: CartItem[]): number { ... }
function formatPrice(cents: number): string { ... }

// Avoid - one function doing too many things
function calculateAndFormatTotal(items: CartItem[]): string { ... }
```

## Don't Repeat Yourself (DRY Principle)

If you're writing the same code in multiple places, pull it out into a reusable function. Think of it like creating a recipe instead of writing out the same cooking steps every time.

**In practice:**

- Write code once, use it everywhere
- Create helper functions in `app/lib/` for common tasks
- If you copy-paste code, that's a sign to create a reusable function

**Example:**

```typescript
// Good - write once, use many times (app/lib/format.ts)
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

// Then use it anywhere you need it
const productPrice = formatCurrency(5000);  // "$50.00"
const cartTotal = formatCurrency(15000);    // "$150.00"

// Avoid - repeating the same logic
const productDollars = 5000 / 100;
const productFormatted = `$${productDollars.toFixed(2)}`;
// ... then doing it all again for cart total
```

## File Header Comments (Required for Every File)

Every file must start with a comment block that explains what the file does, why it exists, and how it works. This helps anyone—even non-developers—understand the file's purpose at a glance.

**Required format:**

```typescript
// ============================================
// [FILE PURPOSE IN ALL CAPS]
// What: [One sentence describing what this file does]
// Why: [One sentence explaining why this file exists or why it matters]
// How: [How it works - required; short phrase if simple, detailed if complex]
// ============================================
```

**Examples:**

```typescript
// ============================================
// SYSTEM PROMPT BUILDER
// What: Constructs the system prompt that tells Claude how to categorize tasks
// Why: Prompt quality directly controls categorization accuracy
// How: Injects today's date for relative date math, includes few-shot examples
//      with computed dates, and defines strict JSON output format
// ============================================
```

```typescript
// ============================================
// TASK ANALYZER E2E TESTS
// What: Tests the full flow: submit task → AI analysis → display results
// Why: Validates reliability of categorization, priority, and date extraction
// How: Uses Playwright to simulate real browser interactions with live AI calls
// ============================================
```

```typescript
// ============================================
// INPUT VALIDATOR
// What: Validates user task input before sending to AI
// Why: Prevents bad data from wasting API calls
// How: Checks string length (3-500 chars) and returns error messages
// ============================================
```

**Rules:**
- Every `.ts`, `.tsx`, `.js`, `.jsx` file must have this header
- All three lines (What/Why/How) are **required** for consistency
- Keep each line under 80 characters
- Use active voice ("Constructs", "Tests", "Handles")
- The "How" line can be short if the implementation is simple (e.g., "Exports utility functions") or detailed if complex (e.g., multi-line explanation)
- Update the header when the file's purpose changes

## Write for Humans (Clear Comments for Code Sections)

Comments should explain what's happening and why, using everyday language. Imagine explaining the code to someone who's never programmed before.

**Comment structure:**

1. **Section headers** - What is this group of code responsible for?
2. **Why explanations** - Why are we doing this?
3. **What descriptions** - What does this specific part do?

**In practice:**

```typescript
// ============================================
// SHOPPING CART STATE MANAGEMENT
// This section handles adding, removing, and updating cart items
// ============================================

// Create context so any component can access cart state
const CartContext = createContext<CartContextType | null>(null);

// When someone adds an item, we need to:
// 1. Create a cart if one doesn't exist yet
// 2. Add the item to the cart
// 3. Save the cart ID so it persists after page refresh
const addItem = async (variantId: string, quantity: number) => {
  // Create cart if this is the first item being added
  if (!cartId) {
    const newCartId = await createCart();
    // Save to browser storage so cart persists across pages
    localStorage.setItem('medusa_cart_id', newCartId);
  }

  // Add the item to the cart on the server
  await medusaClient.carts.addLine(cartId, variantId, quantity);
};
```

**Guidelines for section comments:**

- Use plain language anyone can understand
- Explain the "why" not just the "what"
- **Use section dividers (`// ============`) to break up major code sections** (50+ lines)
- Add 1-2 line comments above complex logic blocks
- If someone without coding experience reads it, they should get the general idea
- For major sections (authentication flow, data processing, etc.), add a 2-3 line explanation

**When to add section dividers:**
- Separating different logical areas (e.g., "State Management" vs "API Calls" vs "Helper Functions")
- Before a group of related functions (e.g., "Date calculation helpers")
- When switching between different concerns in a single file

## File Organization

**Structure your files logically:**

- Group related functions together
- Put helper functions at the bottom or in a separate file
- Use clear, descriptive file names
- Follow the Next.js App Router directory structure

**Example structure:**

```
/app
  /lib                              ← Business logic & data
    medusa-client.ts               ← API client & data fetching
    colors.ts                       ← Design system colors
    utils.ts                        ← Helper functions
  /context                          ← Shared state (React Context)
    CartContext.tsx                ← Cart state management
    ThemeContext.tsx               ← Dark mode state
  /components                       ← Reusable React components
    Button.tsx                      ← Button component
    Card.tsx                        ← Card layout component
    ProductCard.tsx                ← Product display component
  /shop                             ← Feature folder
    page.tsx                        ← Shop listing page
    [productId]
      page.tsx                      ← Product detail page
  /api                              ← API routes
    /cart
      route.ts                      ← Cart operations (GET, POST)
    /shop
      /products
        route.ts                    ← Product listing endpoint
```

**Key principles:**

- **Pages** (`page.tsx`) handle routing and data loading
- **Components** are reusable UI pieces with clear props
- **Lib functions** handle logic (no React-specific code)
- **Context** manages state that's shared across pages
- **API routes** handle backend operations

## Naming Conventions

Use names that clearly describe what something does:

**Components and variables:**

- `AddToCartButton` not `Button1`
- `ProductCard` not `Card`
- `cartItems` not `items`
- `isLoadingProducts` not `loading`
- `selectedVariantId` not `id`

**Functions:**

- `calculateCartTotal()` not `calc()`
- `formatProductPrice()` not `format()`
- `fetchProductById()` not `get()`
- `isProductOutOfStock()` not `check()`

**Context and hooks:**

- `useCart()` not `useData()`
- `CartContext` not `Context`
- `isAuthenticatedUser` not `loggedIn`

**Event handlers:**

- `handleAddToCart()` not `onClick()`
- `handleRemoveFromCart()` not `onRemove()`
- `handleQuantityChange()` not `onChange()`

Think of it like labeling moving boxes - future you (and others) will thank you for being specific. Good names make code self-documenting.

## TypeScript Best Practices

Use TypeScript to make code safer and more self-documenting.

**Define types for data structures:**

```typescript
// Good - clear what data we're working with
interface Product {
  id: string;
  title: string;
  description: string;
  prices: Price[];
  variants: ProductVariant[];
}

interface CartItem {
  product_id: string;
  variant_id: string;
  quantity: number;
}

// Now use them consistently
function addToCart(item: CartItem): void {
  // TypeScript ensures only valid CartItem data reaches this function
}
```

**Use function return types:**

```typescript
// Good - reader knows what this function returns
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Good - explicitly returns nothing
function logCartUpdate(cartId: string): void {
  console.log(`Cart ${cartId} updated`);
}

// Avoid - unclear what's returned
function processCart(items) {
  // ...what does this actually return?
}
```

**Use `const` for types and interfaces:**

```typescript
// Good - const won't be reassigned
const sampleCart: Cart = {
  id: 'cart_123',
  items: [],
};

// Avoid - let allows reassignment (usually not intended)
let cart = { id: 'cart_123' };
```

**Prefer interfaces for objects, types for unions:**

```typescript
// Good - interface for data structures
interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
}

// Good - type for unions and combinations
type UserRole = 'admin' | 'customer' | 'guest';
type Result<T> = { success: true; data: T } | { success: false; error: string };

// Avoid - overusing type for simple objects
type CartInterface = {
  id: string;
  items: CartItem[];
};
```
