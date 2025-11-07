export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#23232b] via-[#18181b] to-[#23232b] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold mb-4 text-[#6f6f7c]">404</h1>
        <h2 className="text-3xl font-bold mb-4">Link Not Found</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          The shortened URL you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 text-lg font-semibold bg-gradient-to-r from-[#41414b] to-[#6f6f7c] hover:from-[#6f6f7c] hover:to-[#41414b] transition rounded-md"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}
