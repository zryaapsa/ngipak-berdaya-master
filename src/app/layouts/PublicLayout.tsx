import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
