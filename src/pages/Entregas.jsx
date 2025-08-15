import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Alert, Spinner } from "react-bootstrap";

const Entregas = () => {
  const [numPedido, setNumPedido] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [pdf, setPdf] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // Previsualizar PDF antes de subir
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF");
      setPdf(null);
      setPreview(null);
      return;
    }
    setPdf(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!numPedido || !pdf) {
      setError("Número de pedido y PDF son obligatorios");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("num_pedido", numPedido);
    formData.append("observaciones", observaciones);
    formData.append("pdf", pdf);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/entregas",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMensaje(res.data.message);
      setNumPedido("");
      setObservaciones("");
      setPdf(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      setError("Error al registrar la entrega");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Registrar Entrega</h2>
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Número de Pedido</Form.Label>
          <Form.Control
            type="text"
            value={numPedido}
            onChange={(e) => setNumPedido(e.target.value)}
            placeholder="Ingrese número de pedido"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Observaciones</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Escriba observaciones (opcional)"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Archivo PDF</Form.Label>
          <Form.Control
            type="file"
            accept="application/pdf"
            onChange={handlePdfChange}
            required
          />
        </Form.Group>

        {/* Previsualización */}
        {preview && (
          <div className="mb-3">
            <p>Previsualización PDF:</p>
            <iframe
              src={preview}
              title="PDF Preview"
              style={{
                width: "100%",
                height: "400px",
                border: "1px solid #ccc",
              }}
            ></iframe>
          </div>
        )}

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" /> Cargando...
            </>
          ) : (
            "Guardar Entrega"
          )}
        </Button>
      </Form>
    </div>
  );
};

export default Entregas;
