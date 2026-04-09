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
function normalizePayload(data) {
  if (data && typeof data === 'object') {
    if (data.payload && typeof data.payload === 'object') return data.payload;
    if (data.body && typeof data.body === 'object') return data.body;
  }
  return data;
}

function parseProductionPayload(data) {
  const normalized = normalizePayload(data);

  if (Array.isArray(normalized) && normalized.length) {
    return { summary: null, bars: normalized };
  }
  if (normalized && typeof normalized === 'object' && ('taxa_acerto' in normalized || 'total_pecas' in normalized)) {
    const taxa = parseFloat(String(normalized.taxa_acerto ?? '0').replace('%', '')) || 0;
    const ok = Number(normalized.total_pecas) || 0;
    const ciclos = Number(normalized.total_ciclos) || 0;
    const falhas = Math.max(0, ciclos - ok);
    const pctOk = ciclos > 0 ? Math.round((ok / ciclos) * 100) : 0;
    const pctFail = ciclos > 0 ? Math.round((falhas / ciclos) * 100) : 0;
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const summary = {
      estado: String(normalized.status_robo ?? '—'),
      taxaTexto: String(normalized.taxa_acerto ?? `${taxa.toFixed(1)}%`),
      pecasOk: ok,
      ciclos,
      falhas,
      ultimoLog: String(normalized.ultimo_log ?? '—'),
      atualizado: t,
    };

    const statusText = String(normalized.status_robo ?? '').toUpperCase();
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

function isRampa1Executing(data) {
  if (data == null) return false;
  const raw = typeof data === 'string' ? data : JSON.stringify(data);
  return /rampa\s*1|rampa1|programa em execu[cç][ãa]o:\s*rampa 1/i.test(raw);
}

function isRampa2Executing(data) {
  if (data == null) return false;
  const raw = typeof data === 'string' ? data : JSON.stringify(data);
  return /rampa\s*2|rampa2|programa em execu[cç][ãa]o:\s*rampa 2/i.test(raw);
}

function isRampa3Executing(data) {
  if (data == null) return false;
  const raw = typeof data === 'string' ? data : JSON.stringify(data);
  return /rampa\s*3|rampa3|programa em execu[cç][ãa]o:\s*rampa 3/i.test(raw);
}

const Dashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [now, setNow] = useState(new Date());
  const [productionSummary, setProductionSummary] = useState(null);
  const [nrLive, setNrLive] = useState(false);
  const [lastPayload, setLastPayload] = useState(null);
  const [rampa1Executing, setRampa1Executing] = useState(false);
  const [rampa2Executing, setRampa2Executing] = useState(false);
  const [rampa3Executing, setRampa3Executing] = useState(false);

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
      console.log('[SSE] conectado em http://localhost:3001/events');
      setNrLive(true);
    };

    source.onmessage = (event) => {
      console.log('[SSE] evento recebido:', event.data);
      setLastPayload(event.data);
      setRampa1Executing(isRampa1Executing(event.data));
      setRampa2Executing(isRampa2Executing(event.data));
      setRampa3Executing(isRampa3Executing(event.data));
      try {
        const payload = JSON.parse(event.data);
        setRampa1Executing(isRampa1Executing(payload));
        setRampa2Executing(isRampa2Executing(payload));
        setRampa3Executing(isRampa3Executing(payload));
        const next = parseProductionPayload(payload);
        if (next) {
          setChartData(next.bars);
          setProductionSummary(next.summary);
          setNrLive(true);
        } else {
          console.warn('[SSE] payload não corresponde ao formato esperado:', payload);
        }
      } catch (error) {
        console.warn('[SSE] Payload inválido:', event.data, error);
      }
    };

    source.onerror = (event) => {
      console.warn('[SSE] erro de conexão', event);
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

        <div className="image-container">
          <img src="./robo2.jpeg" alt="Robo 2" className="robo-image-centered" />
        </div>

        <section className="content-grid">
          <div className="action-column">
            <button className={`call-btn ${rampa1Executing ? 'blink-red' : ''}`}>Rampa 1</button>
            <button className={`call-btn ${rampa2Executing ? 'black-active blink-black' : ''}`}>Rampa 2</button>
            <button className={`call-btn ${rampa3Executing ? 'gray-active blink-gray' : ''}`}>Rampa 3</button>
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

               {lastPayload && (
                 <div className="raw-payload-card">
                   <h3>Resposta do Node-RED</h3>
                   <pre>{lastPayload}</pre>
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