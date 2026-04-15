<div align="center">

# Supervision Lab 2

Dashboard de supervisão de produção em tempo real para laboratório com robô, integrado ao **Node-RED** via Server-Sent Events (SSE).

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

</div>

## Sumário

- [Sobre](#sobre)
- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Começando](#começando)
- [Scripts](#scripts)
- [Configuração e integração](#configuração-e-integração)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Licença](#licença)

---

## Sobre

Interface web em **React** que exibe indicadores de produção, estado do robô e detecção de execução por rampa. Os dados chegam por **SSE** a partir de um serviço local (tipicamente um fluxo **Node-RED** que repassa eventos para `http://localhost:3001/events`).

## Funcionalidades

- Painel com indicadores de produção e barras de métricas
- Conexão em tempo real via `EventSource` (SSE)
- Resumo de produção (`taxa_acerto`, peças OK, ciclos, falhas, logs)
- Destaque visual para **Rampa 1**, **Rampa 2** e **Rampa 3** conforme o payload recebido

## Stack

| Tecnologia | Uso |
|------------|-----|
| [React](https://react.dev/) | UI do dashboard |
| [Vite](https://vitejs.dev/) | Dev server e build |
| [ESLint](https://eslint.org/) | Lint do código |

## Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado), com `npm`
- Serviço HTTP que exponha **SSE** em `http://localhost:3001/events` (ex.: Node-RED ou proxy)

## Começando

### Instalação

```bash
git clone https://github.com/<usuario>/<repositorio>.git
cd <repositorio>
npm install
```

> Se você já tiver a pasta do projeto localmente, basta `cd` até ela e executar `npm install`.

### Desenvolvimento

```bash
npm run dev
```

Abra no navegador o endereço exibido no terminal (por padrão [http://localhost:5173](http://localhost:5173)).

### Build de produção

```bash
npm run build
npm run preview
```

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Gera build otimizado em `dist/` |
| `npm run preview` | Serve o conteúdo de `dist/` localmente |
| `npm run lint` | Executa o ESLint no projeto |

## Configuração e integração

### Endpoint SSE

O cliente usa URL fixa:

```text
http://localhost:3001/events
```

Sem esse endpoint ativo, o painel indica estado offline até receber o primeiro payload válido.

### Formato do payload (JSON)

Objeto de produção reconhecido (campos principais):

| Campo | Descrição |
|-------|-----------|
| `status_robo` | Estado do robô (`RUNNING`, `STOPPED`, `IDLE`, etc.) |
| `taxa_acerto` | Taxa de acerto (número ou string com `%`) |
| `total_pecas` | Peças OK |
| `total_ciclos` | Total de ciclos |
| `ultimo_log` | Texto do último log |

Alternativas aceitas:

- Array de barras: `{ label, value, color, time }[]`
- Payload aninhado em `payload` ou `body`

### Rampas

Texto ou JSON é analisado para detectar execução nas rampas (ex.: `rampa 1`, `rampa1`, `programa em execução: rampa 2`).

## Estrutura do repositório

```text
Aula-Robo-Lab2/
├── public/          # Assets estáticos (imagens, favicon)
├── src/
│   ├── App.jsx      # Dashboard, SSE e parsing dos dados
│   ├── Dashboard.css
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

## Licença

Este projeto é **privado** (`"private": true` no `package.json`). Ajuste esta seção se adotar uma licença aberta (por exemplo MIT ou Apache-2.0).
