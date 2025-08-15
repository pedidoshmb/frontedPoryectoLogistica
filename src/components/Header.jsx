import React from "react";

export default function Header({ onLogout }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#333",
        color: "#fff",
      }}
    >
      {/* Aquí tu contenido del header, por ejemplo título */}
      <h1>PROYECTO LOGÍSTICAaaa </h1>

      <button
        onClick={onLogout}
        style={{
          backgroundColor: "#e74c3c",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#c0392b")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#e74c3c")}
      >
        Cerrar sesión
      </button>
    </header>
  );
}
