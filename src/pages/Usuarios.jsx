import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const Usuarios = () => {
  const baseURL = "http://localhost:5000/usuarios";

  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    login: "",
    password: "",
    nombre: "",
    cedula: "",
    rol: "",
  });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // Traer usuarios desde la base de datos
  const fetchUsuarios = async () => {
    try {
      const res = await axios.get(baseURL);
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${baseURL}/${editId}`, form);
        setMensaje("Usuario actualizado exitosamente");
      } else {
        await axios.post(baseURL, form);
        setMensaje("Usuario creado exitosamente");
      }
      setForm({
        login: "",
        password: "",
        nombre: "",
        cedula: "",
        rol: "",
      });
      setEditId(null);
      setShowModal(false);
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      setError("Error al guardar usuario");
    }
  };

  const handleEdit = (usuario) => {
    setForm({
      login: usuario.login || "",
      password: "",
      nombre: usuario.nombre || "",
      cedula: usuario.cedula || "",
      rol: usuario.rol || "", // Aquí tomamos directamente el rol de la DB
    });
    setEditId(usuario.id);
    setShowModal(true);
  };

  const handleInactivar = async (id) => {
    try {
      await axios.put(`${baseURL}/${id}`, { ...form, activo: 0 });
      setMensaje("Usuario inactivado");
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      setError("Error al inactivar usuario");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Usuarios</h2>
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Nuevo Usuario
      </Button>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Login</th>
            <th>Nombre</th>
            <th>Cédula</th>
            <th>Rol</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.login || "-"}</td>
              <td>{u.nombre || "-"}</td>
              <td>{u.cedula || "-"}</td>
              <td>
                {u.rol ? u.rol.charAt(0).toUpperCase() + u.rol.slice(1) : "-"}
              </td>
              <td>
                {u.activo !== undefined ? (u.activo ? "Sí" : "No") : "Sí"}
              </td>
              <td>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEdit(u)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleInactivar(u.id)}
                >
                  Inactivar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Editar Usuario" : "Nuevo Usuario"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Login</Form.Label>
              <Form.Control
                name="login"
                value={form.login}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Password {editId ? "(dejar en blanco para no cambiar)" : ""}
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cédula</Form.Label>
              <Form.Control
                name="cedula"
                value={form.cedula}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar rol</option>
                <option value="admin">Admin</option>
                <option value="operador">Operador</option>
                <option value="auditor">Auditor</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit">{editId ? "Actualizar" : "Crear"}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Usuarios;
