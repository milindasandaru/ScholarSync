import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="relative mb-8">
        <span className="absolute inset-0 animate-pulse rounded-full blur-2xl bg-gradient-to-tr from-pink-400 via-blue-400 to-purple-400 opacity-40 w-48 h-48" />
        <span className="relative text-7xl font-extrabold tracking-tight drop-shadow-lg animate-bounce">404</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-2 animate-fade-in">Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8 animate-fade-in delay-100">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/80 transition-colors animate-fade-in delay-200">
        Go Home
      </Link>
    </div>
  );
}

// Animations (add to your globals.css if not present):
// .animate-fade-in { animation: fadeIn 0.7s both; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
