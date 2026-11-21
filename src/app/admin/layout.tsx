export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 bg-cinema-bg p-8">{children}</main>
    </div>
  );
}
import { AdminSidebar } from "@/components/admin/AdminSidebar";
