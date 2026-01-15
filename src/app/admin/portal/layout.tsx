export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4 space-y-4">
        <h1 className="font-bold text-lg">Admin</h1>

        <nav className="flex flex-col gap-2">
          <a href="/admin/portal" className="underline">Dashboard</a>
        </nav>

        <form action="/api/admin/logout" method="post">
          <button className="text-red-600">Logout</button>
        </form>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
