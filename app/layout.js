import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Australian Population Dashboard',
  description: 'Live metric updates sourced directly via ABS REST Services',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
