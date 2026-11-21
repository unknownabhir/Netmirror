import Link from "next/link";

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-cinema-sidebar h-screen p-6 border-r border-cinema-border flex flex-col">
      <div className="text-xl font-bold text-brand mb-10">WATCH <span className="text-white">MOVIE</span></div>
      <nav className="flex flex-col gap-4 text-gray-400">
        <Link href="/admin" className="hover:text-white">Dashboard</Link>
        <Link href="/admin/content" className="hover:text-white">Content Manager</Link>
        <Link href="/admin/categories" className="hover:text-white">Categories</Link>
      </nav>
    </aside>
  );
}
