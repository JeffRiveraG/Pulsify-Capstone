import "./globals.css";
import { IBM_Plex_Mono } from "next/font/google";



const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"], // ✅ Make sure these match the valid weights
  variable: "--font-plex", // optional if you're using Tailwind variables
});


export const metadata = {
  title: "PULSIFY",
  description: "A simplified audio remix Webapp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plexMono.className}>
      <body>
        {children}
      </body>
    </html>
  );
}