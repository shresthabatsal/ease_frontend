import Header from "./(public)/_components/Header";

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-black">Home</h1>
      </main>
    </div>
  );
}
