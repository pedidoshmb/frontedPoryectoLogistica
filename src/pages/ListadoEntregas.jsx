import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";

const ListadoEntregas = () => {
  const [entregas, setEntregas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pdfPreview, setPdfPreview] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/entregas")
      .then((res) => setEntregas(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handlePreview = (pdfPath) => {
    setPdfPreview(`http://localhost:3000/${pdfPath}`);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  return (
    <div className="container mt-5">
      <h2>Listado de Entregas</h2>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>N° Pedido</th>
            <th>Observaciones</th>
            <th>Fecha Registro</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {entregas.map((entrega) => (
            <tr key={entrega.id}>
              <td>{entrega.num_pedido}</td>
              <td>{entrega.observaciones}</td>
              <td>{new Date(entrega.fecha_registro).toLocaleString()}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handlePreview(entrega.pdf_path)}
                >
                  Previsualizar
                </Button>
                <a
                  href={`http://localhost:3000/${entrega.pdf_path}`}
                  className="btn btn-secondary btn-sm"
                  download
                >
                  Descargar
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Bootstrap */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Previsualizar PDF</Modal.Title>
          <a href={pdfPreview} className="btn btn-success ms-3" download>
            Descargar
          </a>
        </Modal.Header>
        <Modal.Body style={{ height: "80vh" }}>
          <iframe
            src={pdfPreview}
            title="PDF Preview"
            style={{ width: "100%", height: "100%" }}
          ></iframe>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListadoEntregas;
