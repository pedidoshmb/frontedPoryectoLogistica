import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children, onLogout }) {
  return (
    <div className="d-flex" id="wrapper">
      <Sidebar />
      <div id="page-content-wrapper" className="w-100">
        <Header onLogout={onLogout} />
        <div className="container-fluid p-4">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
