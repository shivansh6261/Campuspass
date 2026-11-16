
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata = {
  title: "CampusPass | SGSITS Events",
  description:
    "College events, registrations and verified digital passes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
