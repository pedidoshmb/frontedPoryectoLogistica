import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { Pie, Line } from "react-chartjs-2";
import { PointElement, LineElement } from "chart.js"; // Agregar LineElement
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

// Registrar los elementos necesarios de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement // Registrar el LineElement
);

const API = "http://localhost:5000"; // Asegúrate de que esta sea la URL correcta de tu backend.

function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Obtener el token de autenticación del localStorage (o donde lo tengas almacenado)
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }

    // Obtener los pedidos con la descripción del estado.
    axios
      .get(`${API}/pedidos`, {
        headers: {
          Authorization: `Bearer ${token}`, // Agregar el token al encabezado de la solicitud
        },
      })
      .then((res) => {
        console.log("Respuesta de API:", res.data); // Verifica los datos recibidos
        setPedidos(res.data);
        calcularEstadisticas(res.data);
        setLoading(false);
      })
      .catch((err) => {
        // Revisar si el error tiene una respuesta
        const errorMessage = err.response
          ? err.response.data.message || err.response.statusText
          : err.message;
        setError(`Hubo un error al cargar los datos: ${errorMessage}`);
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  // Función para calcular las estadísticas de los pedidos.
  const calcularEstadisticas = (pedidos) => {
    const totalPedidos = pedidos.length;
    const pedidosPorEstado = pedidos.reduce((acc, pedido) => {
      const estado = pedido.descripcion_estado?.toLowerCase() || "otro";
      acc[estado] = acc[estado] ? acc[estado] + 1 : 1;
      return acc;
    }, {});

    setEstadisticas({
      totalPedidos,
      pedidosPorEstado,
    });
  };

  // Gráfico de "Pedidos por Estado"
  const datosGraficoEstados = {
    labels: Object.keys(estadisticas.pedidosPorEstado || {}),
    datasets: [
      {
        data: Object.values(estadisticas.pedidosPorEstado || {}),
        backgroundColor: [
          "#ffcc00",
          "#4f93f2",
          "#ff7f0e",
          "#28a745",
          "#e2e3e5",
        ],
      },
    ],
  };

  // Gráfico de "Pedidos Registrados por Mes"
  const pedidosUltimoMes = pedidos.filter((p) => {
    const fechaPedido = new Date(p.fecha_entrega_cliente);
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 1);
    return fechaPedido >= fechaLimite;
  });

  const datosGraficoPedidosMes = {
    labels: ["Pedidos Registrados", "Pedidos en el Último Mes"],
    datasets: [
      {
        data: [estadisticas.totalPedidos || 0, pedidosUltimoMes.length],
        backgroundColor: ["#007bff", "#17a2b8"],
      },
    ],
  };

  // Opciones para gráficos
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw} pedidos`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Meses",
        },
      },
      y: {
        title: {
          display: true,
          text: "Cantidad de Pedidos",
        },
        min: 0,
      },
    },
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container>
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Estadísticas de Pedidos</Card.Header>
            <Card.Body>
              <h5>Total de Pedidos Registrados</h5>
              <h2>{estadisticas.totalPedidos || 0}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Pedidos por Estado</Card.Header>
            <Card.Body>
              <Pie data={datosGraficoEstados} options={options} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Pedidos Registrados (Último Mes)</Card.Header>
            <Card.Body>
              <Line data={datosGraficoPedidosMes} options={options} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
    </Container>
  );
}

export default Dashboard;
