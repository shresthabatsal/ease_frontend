import Header from "@/components/layout/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center p-6">{children}</main>
    </div>
  );
}
