import React, { useEffect, useState } from "react";
import axios from "axios";

const RegPedidos = () => {
  const [estados, setEstados] = useState([]);
  const [clienteBusqueda, setClienteBusqueda] = useState("");
  const [sugerenciasClientes, setSugerenciasClientes] = useState([]);

  const [formData, setFormData] = useState({
    id_cliente: "",
    nit: "",
    num_pedido: "",
    numero_items: "",
    separador: "",
    auditor: "",
    id_estado: "",
    fecha_hora_entrega_ventas: "",
    usuario_id: "",
  });

  // Cargar estados al iniciar
  useEffect(() => {
    axios
      .get("http://localhost:5000/estados")
      .then((res) => setEstados(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Buscar clientes mientras se escribe
  useEffect(() => {
    if (clienteBusqueda.length > 1) {
      axios
        .get(`http://localhost:5000/clientes/buscar?q=${clienteBusqueda}`)
        .then((res) => {
          console.log("Clientes encontrados:", res.data);
          setSugerenciasClientes(res.data);
        })
        .catch((err) => console.error(err));
    } else {
      setSugerenciasClientes([]);
    }
  }, [clienteBusqueda]);

  // Manejar cambios en inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Guardar pedido en base de datos
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/pedidos", formData)
      .then((res) => {
        alert("Pedido registrado con éxito ✅");
        setFormData({
          id_clientes: "",
          nit: "",
          num_pedido: "",
          numero_items: "",
          separador: "",
          auditor: "",
          id_estado: "",
          fecha_hora_entrega_ventas: "",
          usuario_id: "",
        });
        setClienteBusqueda("");
      })
      .catch((err) => {
        console.error(err);
        alert("Error al registrar pedido ❌");
      });
  };

  return (
    <div className="container mt-4">
      <h2>Registrar Pedido</h2>
      <form onSubmit={handleSubmit}>
        {/* Cliente con autocompletado */}
        <div className="mb-3">
          <label>Cliente</label>
          <input
            type="text"
            className="form-control"
            value={clienteBusqueda}
            onChange={(e) => {
              setClienteBusqueda(e.target.value);
              setFormData({ ...formData, id_cliente: "", nit: "" });
            }}
            placeholder="Buscar cliente por nombre"
            required
          />
          {sugerenciasClientes.length > 0 && (
            <ul className="list-group mt-1">
              {sugerenciasClientes.map((cliente) => (
                <li
                  key={cliente.id}
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      id_cliente: cliente.id,
                      nit: cliente.nit,
                    });
                    setClienteBusqueda(cliente.nombre);
                    setSugerenciasClientes([]);
                  }}
                >
                  {cliente.nombre} - {cliente.nit}
                </li>
              ))}
            </ul>
          )}
          {formData.id_cliente && (
            <small className="text-success">Cliente seleccionado ✓</small>
          )}
        </div>

        {/* NIT */}
        <div className="mb-3">
          <label>NIT</label>
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
          <label>Número de Pedido</label>
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
          <label>Número de Ítems</label>
          <input
            type="number"
            name="numero_items"
            className="form-control"
            value={formData.numero_items}
            onChange={handleChange}
            required
          />
        </div>

        {/* Separador */}
        <div className="mb-3">
          <label>Separador</label>
          <input
            type="text"
            name="separador"
            className="form-control"
            value={formData.separador}
            onChange={handleChange}
            required
          />
        </div>

        {/* Auditor */}
        <div className="mb-3">
          <label>Auditor</label>
          <input
            type="text"
            name="auditor"
            className="form-control"
            value={formData.auditor}
            onChange={handleChange}
            required
          />
        </div>

        {/* Estado */}
        <div className="mb-3">
          <label>Estado</label>
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
          <label>Fecha y Hora Entrega Ventas</label>
          <input
            type="datetime-local"
            name="fecha_hora_entrega_ventas"
            className="form-control"
            value={formData.fecha_hora_entrega_ventas}
            onChange={handleChange}
          />
        </div>

        {/* Usuario ID */}
        <div className="mb-3">
          <label>ID Usuario</label>
          <input
            type="number"
            name="usuario_id"
            className="form-control"
            value={formData.usuario_id}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Guardar Pedido
        </button>
      </form>
    </div>
  );
};

export default RegPedidos;
