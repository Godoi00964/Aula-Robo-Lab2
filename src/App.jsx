import React, { useEffect, useState } from 'react';
import './Dashboard.css';

// Componente Reutilizável para os botões da Sidebar
const NavButton = ({ label, variant, active }) => (
  <button className={`nav-item ${variant} ${active ? 'active' : ''}`}>
    {label}
  </button>
);

/**
 * Array: barras PMG [{ label, value, color, time }].
 * Objeto Node-RED: summary + barras alinhadas à produção (taxa, % sucesso, % falhas).
 */
function parseProductionPayload(data) {
  if (Array.isArray(data) && data.length) {
    return { summary: null, bars: data };
  }
  if (data && typeof data === 'object' && ('taxa_acerto' in data || 'total_pecas' in data)) {
    const taxa = parseFloat(String(data.taxa_acerto ?? '0').replace('%', '')) || 0;
    const ok = Number(data.total_pecas) || 0;
    const ciclos = Number(data.total_ciclos) || 0;
    const falhas = Math.max(0, ciclos - ok);
    const pctOk = ciclos > 0 ? Math.round((ok / ciclos) * 100) : 0;
    const pctFail = ciclos > 0 ? Math.round((falhas / ciclos) * 100) : 0;
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const summary = {
      estado: String(data.status_robo ?? '—'),
      taxaTexto: String(data.taxa_acerto ?? `${taxa.toFixed(1)}%`),
      pecasOk: ok,
      ciclos,
      falhas,
      ultimoLog: String(data.ultimo_log ?? '—'),
      atualizado: t,
    };

    const statusText = String(data.status_robo ?? '').toUpperCase();
    const statusColor = statusText === 'RUNNING'
      ? '#22c55e'
      : statusText === 'STOPPED'
        ? '#ef4444'
        : statusText === 'IDLE'
          ? '#f59e0b'
          : '#3b59ff';
    const statusValue = statusText === 'RUNNING' ? 100 : statusText === 'IDLE' ? 60 : 40;

    const bars = [
      { label: 'Taxa acerto', value: Math.min(100, Math.round(taxa)), color: '#4facfe', time: summary.taxaTexto, suffix: '%' },
      { label: 'Peças OK', value: Math.min(100, pctOk), color: '#71b294', time: `${ok} peças`, suffix: '%' },
      { label: 'Ciclos', value: 100, color: '#8d62ff', time: `${ciclos} ciclos`, suffix: '%' },
      { label: 'Falhas', value: Math.min(100, pctFail), color: '#ff6b6b', time: `${falhas} falhas`, suffix: '%' },
      { label: 'Status', value: statusValue, color: statusColor, time: summary.estado, suffix: '%' },
    ];

    return { summary, bars };
  }
  return null;
}

const Dashboard = () => {
  const [chartData, setChartData] = useState([
    { label: 'Status_Robo', value: 68, color: '#4facfe', time: '08:14' },
    { label: 'Taxa_Acerto', value: 82, color: '#71b294', time: '09:02' },
    { label: 'Total_Pecas', value: 57, color: '#ff9a56', time: '09:38' },
    { label: 'Total_Ciclos', value: 93, color: '#8d62ff', time: '10:11' },
    { label: 'Falhas', value: 74, color: '#3b59ff', time: '10:45' },
  ]);
  const [now, setNow] = useState(new Date());
  const [productionSummary, setProductionSummary] = useState(null);
  const [nrLive, setNrLive] = useState(false);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dados vindos do servidor SSE (/events -> repassa dados do Node-RED)
  useEffect(() => {
    const source = new EventSource('http://localhost:3001/events');

    source.onopen = () => {
      setNrLive(true);
    };

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const next = parseProductionPayload(payload);
        if (next) {
          setChartData(next.bars);
          setProductionSummary(next.summary);
          setNrLive(true);
        }
      } catch (error) {
        console.warn('[SSE] Payload inválido:', event.data);
      }
    };

    source.onerror = () => {
      setNrLive(false);
    };

    return () => {
      source.close();
    };
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
                   <p className="chart-subtitle">
                      {productionSummary
                       ? `Dados de produção · atualizado às ${productionSummary.atualizado}`
                       : nrLive
                         ? 'Indicadores recebidos do Node-RED'
                        : 'Valores de exemplo até o Node-RED enviar o primeiro payload'}
                   </p>
                 </div>
                 <span className={`chart-note ${nrLive ? 'chart-note-live' : ''}`}>
                   {nrLive ? 'Node-RED' : 'Offline / mock'}
                 </span>
               </div>

               {productionSummary && (
                 <div className="production-metrics" aria-label="Resumo de produção">
                   <div className="production-metric">
                     <span className="production-metric-label">Estado do robô</span>
                     <span className="production-metric-value production-metric-estado">{productionSummary.estado}</span>
                   </div>
                   <div className="production-metric">
                     <span className="production-metric-label">Taxa de acerto</span>
                     <span className="production-metric-value">{productionSummary.taxaTexto}</span>
                   </div>
                   <div className="production-metric">
                     <span className="production-metric-label">Peças OK</span>
                     <span className="production-metric-value">{productionSummary.pecasOk}</span>
                   </div>
                   <div className="production-metric">
                     <span className="production-metric-label">Ciclos</span>
                     <span className="production-metric-value">{productionSummary.ciclos}</span>
                   </div>
                   <div className="production-metric">
                     <span className="production-metric-label">Falhas</span>
                     <span className="production-metric-value">{productionSummary.falhas}</span>
                   </div>
                   <div className="production-metric production-metric-wide">
                     <span className="production-metric-label">Último log</span>
                     <span className="production-metric-log" title={productionSummary.ultimoLog}>
                       {productionSummary.ultimoLog}
                     </span>
                   </div>
                 </div>
               )}

               <div className="chart-bar-grid">
                 {chartData.map((item) => (
                   <div key={item.label} className="chart-bar-item">
                     <div className="bar" style={{ height: `${item.value}%`, background: item.color }}>
                       <span className="bar-value">
                         {item.valueDisplay != null ? item.valueDisplay : `${item.value}${item.suffix ?? '%'}`}
                       </span>
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