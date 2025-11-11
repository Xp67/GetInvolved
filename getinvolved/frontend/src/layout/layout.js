import { Outlet } from "react-router-dom";
import Dashboard from "../components/ui/Dashboard";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

export default function PublicLayout() {
  return (
    <>
      <Dashboard />
      <Header />
      <main className="container">{/* area variabile */}
        <Outlet /> {/* qui entrano le pagine */}
      </main>
      <Footer />
    </>
  );
}
