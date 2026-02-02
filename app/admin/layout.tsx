import AdminSidebar from "./_components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 bg-white p-6 min-h-screen">{children}</main>
    </div>
  );
}
