import React, { useEffect, useState } from 'react';
import './Dashboard.css';

// Componente Reutilizável para os botões da Sidebar
const NavButton = ({ label, variant, active }) => (
  <button className={`nav-item ${variant} ${active ? 'active' : ''}`}>
    {label}
  </button>
);

const Dashboard = () => {
  const [chartData, setChartData] = useState([
    { label: 'PMG 1', value: 68, color: '#4facfe', time: '08:14' },
    { label: 'PMG 2', value: 82, color: '#71b294', time: '09:02' },
    { label: 'PMG 3', value: 57, color: '#ff9a56', time: '09:38' },
    { label: 'PMG 4', value: 93, color: '#8d62ff', time: '10:11' },
    { label: 'PMG 5', value: 74, color: '#3b59ff', time: '10:45' },
  ]);
  const [now, setNow] = useState(new Date());

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);

    // Futuro: buscar dados reais da API e atualizar o gráfico
    // fetch('/api/chart-data')
    //   .then((res) => res.json())
    //   .then((data) => setChartData(data))
    //   .catch(console.error);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="robot-logo">
          <img src="./robo.jpg" alt="Robot" />
        </div>
        
        <nav className="nav-group">
          <NavButton label="Produção" />
          <NavButton label="Relatórios" />
          <NavButton label="Alertas" />
          
          <div className="divider" />
          
          <NavButton label="Home" variant="blue" active />
          <NavButton label="Running" variant="green" />
          <NavButton label="Sleep" variant="red" />
          
          <div className="sidebar-footer">
            <NavButton label="Login" />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-area">
        <header className="top-header">
          <div className="title-box">
            <h1>Supervision Lab 2</h1>
          </div>
          <div className="top-header-right">
            <span className="clock">{formatTime(now)}</span>
          </div>
        </header>

        <section className="content-grid">
          <div className="action-column">
            <button className="call-btn">Call PMG 1</button>
            <button className="call-btn">Call PMG 2</button>
            <button className="call-btn">Call PMG 3</button>
          </div>

          <div className="chart-column">
             <div className="chart-card">
               <div className="chart-header">
                 <div>
                   <h2>Indicadores de Produção</h2>
                   <p className="chart-subtitle">Últimos valores recebidos</p>
                 </div>
                 <span className="chart-note">API Ready</span>
               </div>

               <div className="chart-bar-grid">
                 {chartData.map((item) => (
                   <div key={item.label} className="chart-bar-item">
                     <div className="bar" style={{ height: `${item.value}%`, background: item.color }}>
                       <span className="bar-value">{item.value}%</span>
                     </div>
                     <span className="bar-label">{item.label}</span>
                     <span className="bar-time">{item.time}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;