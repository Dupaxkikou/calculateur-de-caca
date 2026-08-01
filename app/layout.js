import './globals.css';

export const metadata = {
  title: 'Calculateur de Caca 💩',
  description: 'Mesure ta différence de poids avant/après, en moins de 15 secondes.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
