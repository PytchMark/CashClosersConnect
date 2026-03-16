import Link from "next/link";
import { BrandLogo } from "@/components/shared/BrandLogo";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-800 flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <BrandLogo size={88} className="rounded-2xl" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="text-gold-gradient">Cash Closers</span>
          <br />
          <span className="text-white">WhatsApp CRM</span>
        </h1>

        <p className="text-dark-300 max-w-md mx-auto text-lg">
          Internal multi-tenant CRM for managing WhatsApp conversations and sales pipelines.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-gradient-gold text-black font-semibold rounded-full hover:shadow-gold-lg transition-all duration-300 gold-glow-hover"
            data-testid="login-button"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 border border-gold-500 text-gold-500 font-semibold rounded-full hover:bg-gold-500/10 transition-all duration-300"
            data-testid="dashboard-button"
          >
            Go to Dashboard
          </Link>
        </div>

        <p className="text-dark-400 text-sm mt-12">
          Powered by{" "}
          <a
            href="https://cashclosersja.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-500 hover:text-gold-400 transition-colors"
          >
            Cash Closers Jamaica
          </a>
        </p>
      </div>
    </main>
  );
}
