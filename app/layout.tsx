import "./globals.css";
import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aetheria-mind.vercel.app/"),

  title: {
    default: "Aetheria — A Space for Your Thoughts",
    template: "%s | Aetheria",
  },

  description:
    "Aetheria adalah interactive mental sandbox buatan Satrio Wisnu Adi Pratama — mahasiswa Teknik Informatika Politeknik Negeri Malang. Tulis pikiranmu, biarkan melayang sebagai orb bercahaya di ruang tanpa gravitasi.",

  keywords: [
    "Aetheria",
    "Aetheria Mind",
    "Satrio Wisnu Adi Pratama",
    "Satrio Wisnu Adi",
    "Satrio Wisnu",
    "Satrio",
    "satrwisn",
    "Mahasiswa Teknik Informatika",
    "Politeknik Negeri Malang",
    "Polinema",
    "Teknik Informatika",
    "Interactive Mental Sandbox",
    "Mental Wellness App",
    "Zero Gravity App",
    "Thought Visualization",
    "Web Developer Indonesia",
    "Next.js Project",
    "Portfolio Project",
    "Google Vibe Coding",
    "Juara Vibe Coding",
    "Google Event",
  ],

  authors: [{ name: "Satrio Wisnu Adi Pratama" }],

  creator: "Satrio Wisnu Adi Pratama",

  openGraph: {
    title: "Aetheria — A Space for Your Thoughts",
    description:
      "Interactive mental sandbox di mana pikiranmu melayang sebagai orb bercahaya. Dibangun oleh Satrio Wisnu Adi Pratama.",
    url: "https://aetheria-mind.vercel.app/",
    siteName: "Aetheria",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Aetheria — A Space for Your Thoughts",
      },
    ],
    locale: "id_ID",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Aetheria — A Space for Your Thoughts",
    description:
      "Interactive mental sandbox di mana pikiranmu melayang sebagai orb bercahaya. Dibangun oleh Satrio Wisnu Adi Pratama.",
    images: ["/og-image.png"],
    creator: "@satrwisn",
  },

  icons: {
    icon: "/images/icon.png",
    apple: "/images/icon.png",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="theme-dark" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSans.variable} font-dm`}
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>

        {/* Structured Data — Person + WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Satrio Wisnu Adi Pratama",
                url: "https://aetheria-mind.vercel.app/",
                sameAs: [
                  "https://github.com/satriowisnuap",
                  "https://www.linkedin.com/in/satrio-wisnu-adi-pratama-79776928a/",
                  "https://www.instagram.com/satrwisn/",
                  "https://rimbasmita.vercel.app/",
                ],
                jobTitle: "Web Developer",
                affiliation: {
                  "@type": "EducationalOrganization",
                  name: "Politeknik Negeri Malang",
                },
                description:
                  "Mahasiswa Teknik Informatika Politeknik Negeri Malang dan pengembang di balik Aetheria, interactive mental sandbox berbasis Next.js.",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Aetheria",
                url: "https://aetheria-mind.vercel.app/",
                applicationCategory: "LifestyleApplication",
                operatingSystem: "Web",
                author: {
                  "@type": "Person",
                  name: "Satrio Wisnu Adi Pratama",
                },
                description:
                  "Interactive mental sandbox di mana pengguna dapat menulis pikiran yang akan melayang sebagai orb bercahaya dalam ruang tanpa gravitasi.",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "IDR",
                },
              },
            ]),
          }}
        />
      </body>
    </html>
  );
}
