# MirrorMe Admin Dashboard

This is a modern [Next.js](https://nextjs.org) admin dashboard for store management, featuring:

- Inventory management (add/edit/delete products, image upload, category management)
- Customer management (view, search, delete customers)
- Orders and categories pages
- Live stats and search with Supabase integration
- Modern UI with Tailwind CSS
- Authentication (admin login/logout)

## Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Product API Integration

When you add a product, the app will POST to the following external API:

```
POST https://outfit-model-production.up.railway.app/api/v1/items
```

**FormData fields:**
- `id` (the product's ml_id, auto-incremented)
- `category` (the product category)
- `image` (the product image file)

If the API call fails, the product is not added to Supabase and an error is shown.

## CORS Requirements for API

If you control the backend API, you must enable CORS to allow requests from your frontend domain (e.g., `localhost:3000` for development). Example for Express.js:

```js
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));
```

For other frameworks, see their CORS documentation.

## Project Structure
- `src/app/Inventory/page.tsx` — Inventory management UI and logic
- `src/app/customers/page.tsx` — Customer management
- `src/app/orders/page.tsx` — Orders page
- `src/app/categories/page.tsx` — Categories page
- `src/app/dashboard/page.tsx` — Main dashboard with stats

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
