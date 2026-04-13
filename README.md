# Supervision Lab 2

Dashboard web de supervisão de produção para laboratório com robô. Interface em React que consome eventos em tempo real (SSE) vindos de um backend que repassa dados do **Node-RED**.

## Requisitos

- [Node.js](https://nodejs.org/) (versão compatível com Vite 8)
- Serviço SSE em `http://localhost:3001/events` (por exemplo, fluxo Node-RED que expõe essa rota)

## Instalação

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm run dev
```

Abra o endereço indicado no terminal (geralmente `http://localhost:5173`).

## Outros scripts

| Comando        | Descrição              |
|----------------|------------------------|
| `npm run build` | Build de produção     |
| `npm run preview` | Servir o build localmente |
| `npm run lint`  | ESLint no projeto      |

## Integração com Node-RED

O front conecta-se a um **EventSource** fixo em `http://localhost:3001/events`. Sem esse serviço ativo, o painel mostra estado offline e mensagens de exemplo até o primeiro payload válido.

### Formato de payload (objeto de produção)

O app reconhece objetos JSON com campos como:

- `status_robo` — estado do robô (ex.: `RUNNING`, `STOPPED`, `IDLE`)
- `taxa_acerto` — taxa de acerto (número ou string com `%`)
- `total_pecas`, `total_ciclos`
- `ultimo_log` — texto do último log

Também é aceito um **array** de barras no formato `{ label, value, color, time }`, ou o payload encapsulado em `payload` ou `body`.

### Rampas

Mensagens de texto ou JSON são analisadas para destacar execução nas **Rampa 1**, **Rampa 2** e **Rampa 3** (padrões como `rampa 1`, `rampa1`, `programa em execução: rampa 2`, etc.).

## Estrutura principal

- `src/App.jsx` — dashboard, SSE e parsing dos dados
- `src/Dashboard.css` — estilos do painel
- `public/` — imagens (`robo.jpg`, `robo2.jpeg`, favicon)

## Licença

Projeto privado (`private: true` no `package.json`).
