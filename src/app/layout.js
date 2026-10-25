import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/components/CartProvider';

export const metadata = {
  title: 'The Glassy Touch — Premium Crockery & Gifts',
  description: 'Discover elegance in every piece. Shop premium crockery, dinnerware, and unique gifts at The Glassy Touch. Quality products, fast delivery, and exceptional service.',
  keywords: 'crockery, gifts, dinnerware, glassware, ceramic, home decor, tableware, The Glassy Touch',
  openGraph: {
    title: 'The Glassy Touch — Premium Crockery & Gifts',
    description: 'Shop premium crockery and unique gifts. Elegance in every piece.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
