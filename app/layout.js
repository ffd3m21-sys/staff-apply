import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ subsets: ['arabic', 'latin'], weight: ['400', '600', '800', '900'] });

export const metadata = { title: 'Apply | قدّم الآن', description: 'Staff applications' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cairo.className}>{children}</body>
    </html>
  );
}
