import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-panel">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold text-white">404</h1>
        <p className="text-muted">Page not found</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
