import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Modal, Button, Alert, Form } from "react-bootstrap";
import * as XLSX from "xlsx";

const API = "http://localhost:5000";

function RegPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [usuariosBodega, setUsuariosBodega] = useState([]);
  const [estados, setEstados] = useState([]);
  const [clienteBusqueda, setClienteBusqueda] = useState("");
  const [sugerenciasClientes, setSugerenciasClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    id_cliente: "",
    nit: "",
    num_pedido: "",
    numero_items: "",
    separador: "",
    auditor: "",
    id_estado: "",
    fecha_hora_entrega_ventas: "",
    fecha_entrega_cliente: "",
  });

  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 10;

  const token = localStorage.getItem("token");

  // ===== Listar pedidos =====
  const fetchPedidos = useCallback(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get(`${API}/pedidos`, { headers })
      .then((res) => setPedidos(res.data))
      .catch((err) => {
        console.error(err);
        setError("Error al cargar pedidos");
      });
  }, [token]);

  // ===== Cargas iniciales =====
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get(`${API}/usuarios_bodega/activos`, { headers })
      .then((res) => setUsuariosBodega(res.data))
      .catch((err) => console.error(err));

    axios
      .get(`${API}/estados`, { headers })
      .then((res) => setEstados(res.data))
      .catch((err) => console.error(err));

    fetchPedidos();
  }, [token, fetchPedidos]);

  // ===== Autocompletar clientes =====
  useEffect(() => {
    if (clienteBusqueda.length > 1 && token) {
      const headers = { Authorization: `Bearer ${token}` };
      axios
        .get(
          `${API}/clientes/buscar?q=${encodeURIComponent(clienteBusqueda)}`,
          { headers }
        )
        .then((res) => setSugerenciasClientes(res.data))
        .catch((err) => console.error(err));
    } else {
      setSugerenciasClientes([]);
    }
  }, [clienteBusqueda, token]);

  // ===== Handlers =====
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditar = (pedido) => {
    setFormData({
      id: pedido.id,
      id_cliente: pedido.id_cliente,
      nit: pedido.nit,
      num_pedido: pedido.num_pedido,
      numero_items: pedido.numero_items,
      separador: pedido.separador,
      auditor: pedido.auditor,
      id_estado: pedido.id_estado,
      fecha_hora_entrega_ventas:
        pedido.fecha_hora_entrega_ventas?.slice(0, 16) || "",
      fecha_entrega_cliente: pedido.fecha_entrega_cliente?.slice(0, 10) || "",
    });
    setClienteBusqueda(pedido.nombre_cliente || "");
    setEditando(true);
    setShowModal(true);
  };

  const handleEliminar = (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este pedido?")) return;
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .delete(`${API}/pedidos/${id}`, { headers })
      .then(() => {
        setMensaje("Pedido eliminado ✅");
        fetchPedidos();
      })
      .catch((err) => {
        console.error(err);
        setError("Error al eliminar pedido ❌");
      });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      id_cliente: "",
      nit: "",
      num_pedido: "",
      numero_items: "",
      separador: "",
      auditor: "",
      id_estado: "",
      fecha_hora_entrega_ventas: "",
      fecha_entrega_cliente: "",
    });
    setClienteBusqueda("");
    setSugerenciasClientes([]);
    setEditando(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!token) {
      setError("No hay token de autenticación. Inicia sesión nuevamente.");
      return;
    }

    let usuario_id = null;
    try {
      const decoded = jwtDecode(token);
      usuario_id = decoded.id;
    } catch {
      setError("Token inválido. Inicia sesión nuevamente.");
      return;
    }

    const datosEnviar = { ...formData, usuario_id };
    const headers = { Authorization: `Bearer ${token}` };

    if (editando && formData.id) {
      axios
        .put(`${API}/pedidos/${formData.id}`, datosEnviar, { headers })
        .then(() => {
          setMensaje("Pedido actualizado con éxito ✅");
          resetForm();
          setShowModal(false);
          fetchPedidos();
        })
        .catch((err) => {
          console.error(err);
          setError("Error al actualizar pedido ❌");
        });
    } else {
      axios
        .post(`${API}/pedidos`, datosEnviar, { headers })
        .then(() => {
          setMensaje("Pedido registrado con éxito ✅");
          resetForm();
          setShowModal(false);
          fetchPedidos();
        })
        .catch((err) => {
          console.error(err);
          setError("Error al registrar pedido ❌");
        });
    }
  };

  // ===== Filtros y paginación =====
  const pedidosFiltrados = pedidos.filter((p) => {
    const fecha = p.fecha_entrega_cliente
      ? new Date(p.fecha_entrega_cliente)
      : null;
    const inicio = filtroFechaInicio ? new Date(filtroFechaInicio) : null;
    const fin = filtroFechaFin ? new Date(filtroFechaFin) : null;
    if (inicio && fecha < inicio) return false;
    if (fin && fecha > fin) return false;
    return true;
  });

  const indexUltimo = paginaActual * pedidosPorPagina;
  const indexPrimero = indexUltimo - pedidosPorPagina;
  const pedidosMostrados = pedidosFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);

  const cambiarPagina = (numero) => setPaginaActual(numero);

  // ===== Exportar a Excel =====
  const exportarExcel = () => {
    const datosExcel = pedidosFiltrados.map((p) => ({
      ID: p.id,
      Numero: p.num_pedido,
      Cliente: p.nombre_cliente || p.id_cliente,
      NIT: p.nit || "-",
      Items: p.numero_items,
      Separador: p.separador,
      Auditor: p.auditor,
      Estado: p.descripcion_estado || p.estado || "-",
      "Entrega Ventas": p.fecha_hora_entrega_ventas || "-",
      "Entrega Cliente": p.fecha_entrega_cliente || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
    XLSX.writeFile(wb, "Pedidos.xlsx");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2>Pedidos</h2>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Registrar Pedido
        </Button>
      </div>

      {/* ===== Filtros de fecha y Excel ===== */}
      <div className="d-flex gap-2 mb-3">
        <Form.Control
          type="date"
          value={filtroFechaInicio}
          onChange={(e) => setFiltroFechaInicio(e.target.value)}
        />
        <Form.Control
          type="date"
          value={filtroFechaFin}
          onChange={(e) => setFiltroFechaFin(e.target.value)}
        />
        <Button variant="success" onClick={exportarExcel}>
          Exportar Excel
        </Button>
      </div>

      {mensaje && (
        <Alert
          className="mt-3 mb-0"
          variant="success"
          onClose={() => setMensaje("")}
          dismissible
        >
          {mensaje}
        </Alert>
      )}
      {error && (
        <Alert
          className="mt-3 mb-0"
          variant="danger"
          onClose={() => setError("")}
          dismissible
        >
          {error}
        </Alert>
      )}

      {/* ===== Tabla de pedidos ===== */}
      <div className="table-responsive mt-3">
        <table className="table align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Número</th>
              <th>Cliente</th>
              <th>NIT</th>
              <th>Ítems</th>
              <th>Separador</th>
              <th>Auditor</th>
              <th>Estado</th>
              <th>Entrega Ventas</th>
              <th>Entrega Cliente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosMostrados.length ? (
              pedidosMostrados.map((p) => {
                const estado = estados.find((e) => e.id === p.id_estado);
                const descripcionEstado = estado
                  ? estado.descripcion_estado
                  : "";

                let colorFondo = "";
                switch (descripcionEstado.toLowerCase()) {
                  case "recibido":
                    colorFondo = "#fff3cd"; // amarillo claro
                    break;
                  case "separando":
                    colorFondo = "#cce5ff"; // azul claro
                    break;
                  case "auditado":
                    colorFondo = "#ffe5b4"; // naranja claro
                    break;
                  case "zonadespacho":
                    colorFondo = "#d4edda"; // verde claro
                    break;
                  case "despachado":
                    colorFondo = "#097e25ff"; // verde oscuro
                    break;
                  case "en ruta":
                    colorFondo = "#d4edda"; // verde claro
                    break;
                  case "entregado":
                    colorFondo = "#0af140ff"; // verde brillante
                    break;
                  default:
                    colorFondo = "#e2e3e5"; // gris claro
                }

                return (
                  <tr key={p.id} style={{ backgroundColor: colorFondo }}>
                    <td>{p.id}</td>
                    <td>{p.num_pedido}</td>
                    <td>{p.nombre_cliente || p.id_cliente}</td>
                    <td>{p.nit || "-"}</td>
                    <td>{p.numero_items}</td>
                    <td>{p.separador}</td>
                    <td>{p.auditor}</td>
                    <td>{descripcionEstado || p.id_estado || "-"}</td>{" "}
                    {/* Mostrar el nombre del estado */}
                    <td>{p.fecha_hora_entrega_ventas || "-"}</td>
                    <td>{p.fecha_entrega_cliente || "-"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEditar(p)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleEliminar(p.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="text-center">
                  No hay pedidos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Paginación ===== */}
      <div className="d-flex justify-content-center mt-3 gap-2">
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
          <Button
            key={num}
            variant={num === paginaActual ? "primary" : "outline-primary"}
            size="sm"
            onClick={() => cambiarPagina(num)}
          >
            {num}
          </Button>
        ))}
      </div>

      {/* ===== Modal Crear/Editar Pedido ===== */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editando ? "Editar Pedido" : "Registrar Pedido"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            {/* Cliente con autocompletado */}
            <div className="mb-3">
              <label className="form-label">Cliente</label>
              <input
                type="text"
                className="form-control"
                value={clienteBusqueda}
                onChange={(e) => {
                  setClienteBusqueda(e.target.value);
                  setFormData((prev) => ({ ...prev, id_cliente: "", nit: "" }));
                }}
                placeholder="Buscar cliente por nombre"
                required
              />
              {sugerenciasClientes.length > 0 && (
                <ul
                  className="list-group mt-1"
                  style={{ maxHeight: 220, overflowY: "auto" }}
                >
                  {sugerenciasClientes.map((cliente) => (
                    <li
                      key={cliente.id}
                      className="list-group-item list-group-item-action"
                      role="button"
                      onMouseDown={() => {
                        setFormData((prev) => ({
                          ...prev,
                          id_cliente: cliente.id,
                          nit: cliente.nit,
                        }));
                        setClienteBusqueda(cliente.nombre);
                        setSugerenciasClientes([]);
                      }}
                    >
                      {cliente.nombre} — {cliente.nit}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* NIT */}
            <div className="mb-3">
              <label className="form-label">NIT</label>
              <input
                type="text"
                name="nit"
                className="form-control"
                value={formData.nit}
                onChange={handleChange}
                required
              />
            </div>

            {/* Número de Pedido */}
            <div className="mb-3">
              <label className="form-label">Número de Pedido</label>
              <input
                type="text"
                name="num_pedido"
                className="form-control"
                value={formData.num_pedido}
                onChange={handleChange}
                required
              />
            </div>

            {/* Número de Ítems */}
            <div className="mb-3">
              <label className="form-label">Número de Ítems</label>
              <input
                type="number"
                name="numero_items"
                className="form-control"
                value={formData.numero_items}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

            {/* Separador */}
            <div className="mb-3">
              <label className="form-label">Separador</label>
              <select
                name="separador"
                className="form-control"
                value={formData.separador}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un separador</option>
                {usuariosBodega.map((u) => (
                  <option key={u.id} value={u.nombre_empleados}>
                    {u.nombre_empleados}
                  </option>
                ))}
              </select>
            </div>

            {/* Auditor */}
            <div className="mb-3">
              <label className="form-label">Auditor</label>
              <select
                name="auditor"
                className="form-control"
                value={formData.auditor}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un auditor</option>
                {usuariosBodega.map((u) => (
                  <option key={u.id} value={u.nombre_empleados}>
                    {u.nombre_empleados}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className="mb-3">
              <label className="form-label">Estado</label>
              <select
                name="id_estado"
                className="form-control"
                value={formData.id_estado}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un estado</option>
                {estados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.descripcion_estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y hora entrega ventas */}
            <div className="mb-3">
              <label className="form-label">Fecha y Hora Entrega Ventas</label>
              <input
                type="datetime-local"
                name="fecha_hora_entrega_ventas"
                className="form-control"
                value={formData.fecha_hora_entrega_ventas}
                onChange={handleChange}
              />
            </div>

            {/* Fecha entrega cliente */}
            <div className="mb-3">
              <label className="form-label">Fecha Entrega Cliente</label>
              <input
                type="date"
                name="fecha_entrega_cliente"
                className="form-control"
                value={formData.fecha_entrega_cliente}
                onChange={handleChange}
                required
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {editando ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default RegPedidos;
