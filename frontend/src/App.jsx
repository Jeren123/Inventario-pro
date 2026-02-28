import { useState, useEffect, useCallback, useRef } from "react";

const API = "http://localhost:8000";

const apiFetch = async (path, options = {}, token = null) => {
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(err.detail || "Error en la petición");
  }
  return res.json();
};

const injectStyles = () => {
  if (document.getElementById("inv-styles")) return;
  const s = document.createElement("style");
  s.id = "inv-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&family=Lora:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:       #f7f6f3;
      --bg2:      #ffffff;
      --bg3:      #f0efe9;
      --border:   #e4e2da;
      --border2:  #d0cec4;
      --ink:      #1a1916;
      --ink2:     #3d3b35;
      --ink3:     #6b6860;
      --ink4:     #9e9b92;
      --green:    #1a6b4a;
      --green2:   #2d9e72;
      --green3:   #e8f5ef;
      --amber:    #92520a;
      --amber2:   #c97b1a;
      --amber3:   #fdf3e3;
      --red:      #8b2215;
      --red2:     #c43a25;
      --red3:     #fdecea;
      --blue:     #1a3f6b;
      --blue2:    #2d6fad;
      --blue3:    #e8f0f9;
      --serif:    'Lora', Georgia, serif;
      --sans:     'Plus Jakarta Sans', system-ui, sans-serif;
      --mono:     'JetBrains Mono', monospace;
      --r:        10px;
      --r2:       7px;
      --shadow:   0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06);
      --shadow2:  0 1px 2px rgba(0,0,0,0.04);
      --ease:     cubic-bezier(0.16, 1, 0.3, 1);
    }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--ink);
      font-family: var(--sans);
      font-size: 14px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* TOPBAR */
    .inv-top {
      height: 58px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 28px;
      position: sticky; top: 0; z-index: 200;
      background: rgba(247,246,243,0.92);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
    }
    .inv-logo { display: flex; align-items: center; gap: 10px; }
    .inv-logo-mark {
      width: 32px; height: 32px;
      background: var(--ink);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .inv-logo-mark svg { color: #f7f6f3; }
    .inv-logo-name {
      font-family: var(--serif);
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--ink);
      letter-spacing: -0.01em;
    }
    .inv-logo-name em { font-style: italic; color: var(--green); }
    .inv-top-right { display: flex; align-items: center; gap: 8px; }
    .inv-user-pill {
      display: flex; align-items: center; gap: 7px;
      padding: 5px 12px;
      background: var(--bg2);
      border: 1px solid var(--border2);
      border-radius: 20px;
      font-size: 0.76rem;
      color: var(--ink2);
      box-shadow: var(--shadow2);
    }
    .inv-user-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--green2);
      box-shadow: 0 0 0 2px var(--green3);
    }
    .inv-role-pill {
      padding: 4px 10px;
      background: var(--ink);
      color: #f7f6f3;
      border-radius: 20px;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .inv-logout {
      width: 34px; height: 34px;
      border-radius: var(--r2);
      border: 1px solid var(--border2);
      background: var(--bg2);
      color: var(--ink3);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      box-shadow: var(--shadow2);
    }
    .inv-logout:hover { background: var(--red3); border-color: rgba(196,58,37,0.3); color: var(--red2); }

    /* NAV */
    .inv-nav {
      display: flex;
      padding: 0 28px;
      background: var(--bg2);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 1px 0 rgba(0,0,0,0.03);
      overflow-x: auto;
    }
    .inv-nav::-webkit-scrollbar { display: none; }
    .inv-nav-btn {
      position: relative;
      display: flex; align-items: center; gap: 6px;
      padding: 13px 16px;
      font-family: var(--sans);
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--ink3);
      background: none; border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: color 0.18s;
    }
    .inv-nav-btn::after {
      content: '';
      position: absolute;
      bottom: 0; left: 16px; right: 16px;
      height: 2px;
      background: var(--ink);
      border-radius: 2px 2px 0 0;
      transform: scaleX(0);
      transition: transform 0.25s var(--ease);
    }
    .inv-nav-btn:hover { color: var(--ink2); }
    .inv-nav-btn.on { color: var(--ink); font-weight: 600; }
    .inv-nav-btn.on::after { transform: scaleX(1); }

    /* MAIN */
    .inv-main { flex: 1; padding: 28px; max-width: 1360px; margin: 0 auto; width: 100%; }
    .inv-app { min-height: 100vh; display: flex; flex-direction: column; }

    /* PAGE HEADER */
    .inv-ph { margin-bottom: 24px; }
    .inv-ph h2 {
      font-family: var(--serif);
      font-size: 1.7rem;
      font-weight: 600;
      color: var(--ink);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .inv-ph p { font-size: 0.8rem; color: var(--ink4); margin-top: 3px; }

    /* STATS */
    .inv-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px,1fr)); gap: 14px; margin-bottom: 24px; }
    .inv-stat {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--r);
      padding: 18px 20px;
      box-shadow: var(--shadow2);
      transition: all 0.25s var(--ease);
      position: relative;
      overflow: hidden;
    }
    .inv-stat:hover { transform: translateY(-2px); box-shadow: var(--shadow); border-color: var(--border2); }
    .inv-stat-accent {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 3px;
    }
    .inv-stat-lbl {
      font-size: 0.67rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--ink4);
      margin-bottom: 8px;
    }
    .inv-stat-val {
      font-family: var(--serif);
      font-size: 2.2rem;
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.03em;
      color: var(--ink);
      margin-bottom: 4px;
    }
    .inv-stat-sub { font-size: 0.7rem; color: var(--ink4); }

    /* CARD */
    .inv-card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--r);
      overflow: hidden;
      box-shadow: var(--shadow2);
    }
    .inv-card-head {
      padding: 14px 18px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      background: var(--bg2);
    }
    .inv-card-title {
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink2);
      display: flex; align-items: center; gap: 7px;
    }

    /* TABLE */
    .inv-table-wrap { overflow-x: auto; }
    .inv-table { width: 100%; border-collapse: collapse; }
    .inv-table th {
      padding: 9px 14px;
      text-align: left;
      font-size: 0.64rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--ink4);
      background: var(--bg3);
      border-bottom: 1px solid var(--border);
    }
    .inv-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      font-size: 0.82rem;
      color: var(--ink2);
      transition: background 0.12s;
    }
    .inv-table tr:last-child td { border-bottom: none; }
    .inv-table tbody tr:hover td { background: var(--bg3); }

    /* BADGES */
    .inv-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.63rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    .inv-badge-green { background: var(--green3); color: var(--green); border: 1px solid rgba(45,158,114,0.2); }
    .inv-badge-red   { background: var(--red3);   color: var(--red);   border: 1px solid rgba(196,58,37,0.2); }
    .inv-badge-amber { background: var(--amber3); color: var(--amber); border: 1px solid rgba(201,123,26,0.2); }
    .inv-badge-blue  { background: var(--blue3);  color: var(--blue);  border: 1px solid rgba(45,111,173,0.2); }
    .inv-badge-gray  { background: var(--bg3);    color: var(--ink3);  border: 1px solid var(--border2); }

    /* FORM */
    .inv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 18px; }
    .inv-col2 { grid-column: span 2; }
    .inv-fg { display: flex; flex-direction: column; gap: 5px; }
    .inv-label { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink3); }
    .inv-input, .inv-select, .inv-textarea {
      background: var(--bg);
      border: 1.5px solid var(--border2);
      color: var(--ink);
      padding: 9px 12px;
      border-radius: var(--r2);
      font-family: var(--sans);
      font-size: 0.83rem;
      outline: none; width: 100%;
      transition: all 0.18s;
    }
    .inv-input:focus, .inv-select:focus, .inv-textarea:focus {
      border-color: var(--green2);
      background: var(--bg2);
      box-shadow: 0 0 0 3px var(--green3);
    }
    .inv-input::placeholder, .inv-textarea::placeholder { color: var(--ink4); }
    .inv-select option { background: var(--bg2); }
    .inv-textarea { resize: vertical; min-height: 72px; }

    /* BUTTONS */
    .inv-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px;
      border-radius: var(--r2);
      font-family: var(--sans);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer; border: none;
      transition: all 0.18s var(--ease);
      letter-spacing: 0.01em;
      white-space: nowrap;
    }
    .inv-btn-primary {
      background: var(--ink);
      color: var(--bg);
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .inv-btn-primary:hover { background: var(--ink2); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .inv-btn-green {
      background: var(--green);
      color: #fff;
      box-shadow: 0 1px 3px rgba(26,107,74,0.3);
    }
    .inv-btn-green:hover { background: var(--green2); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,107,74,0.3); }
    .inv-btn-ghost {
      background: var(--bg2);
      color: var(--ink2);
      border: 1.5px solid var(--border2);
    }
    .inv-btn-ghost:hover { background: var(--bg3); border-color: var(--border2); }
    .inv-btn-danger { background: var(--red3); color: var(--red); border: 1.5px solid rgba(196,58,37,0.2); }
    .inv-btn-danger:hover { background: rgba(196,58,37,0.12); }
    .inv-btn-amber { background: var(--amber3); color: var(--amber); border: 1.5px solid rgba(201,123,26,0.2); }
    .inv-btn-amber:hover { background: rgba(201,123,26,0.12); }
    .inv-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
    .inv-btn-sm { padding: 6px 12px; font-size: 0.73rem; }
    .inv-btn-ico {
      width: 30px; height: 30px; padding: 0;
      border-radius: var(--r2);
      background: var(--bg3);
      border: 1px solid var(--border);
      color: var(--ink3);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.18s;
    }
    .inv-btn-ico:hover { background: var(--red3); border-color: rgba(196,58,37,0.3); color: var(--red2); }
    .inv-btn-ico-edit:hover { background: var(--blue3); border-color: rgba(45,111,173,0.3); color: var(--blue2); }

    /* ALERT */
    .inv-alert {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 14px;
      border-radius: var(--r2);
      font-size: 0.8rem;
      margin-bottom: 14px;
      animation: slideDown 0.22s var(--ease) both;
    }
    .inv-alert-ok  { background: var(--green3); border: 1px solid rgba(45,158,114,0.25); color: var(--green); }
    .inv-alert-err { background: var(--red3);   border: 1px solid rgba(196,58,37,0.25);  color: var(--red); }

    /* LOGIN */
    .inv-login {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 480px;
    }
    .inv-login-left {
      background: var(--ink);
      display: flex; align-items: center; justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;
    }
    .inv-login-left::before {
      content: '';
      position: absolute;
      width: 600px; height: 600px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.04);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
    }
    .inv-login-left::after {
      content: '';
      position: absolute;
      width: 320px; height: 320px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(45,158,114,0.12) 0%, transparent 70%);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
    }
    .inv-login-hero { position: relative; z-index: 1; text-align: center; }
    .inv-login-hero h1 {
      font-family: var(--serif);
      font-size: 3rem;
      font-weight: 600;
      color: #f7f6f3;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 16px;
    }
    .inv-login-hero h1 em { font-style: italic; color: var(--green2); }
    .inv-login-hero p { font-size: 0.85rem; color: rgba(247,246,243,0.45); max-width: 280px; margin: 0 auto; line-height: 1.7; }
    .inv-login-feats { margin-top: 40px; display: flex; flex-direction: column; gap: 12px; text-align: left; }
    .inv-login-feat {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
    }
    .inv-login-feat-ico {
      width: 32px; height: 32px;
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(45,158,114,0.15);
      color: var(--green2);
      flex-shrink: 0;
    }
    .inv-login-feat span { font-size: 0.78rem; color: rgba(247,246,243,0.6); }
    .inv-login-right {
      background: var(--bg);
      display: flex; align-items: center; justify-content: center;
      padding: 48px 40px;
    }
    .inv-login-form-wrap { width: 100%; max-width: 360px; animation: riseUp 0.4s var(--ease) both; }
    .inv-login-form-wrap h2 {
      font-family: var(--serif);
      font-size: 1.6rem;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 6px;
    }
    .inv-login-form-wrap p { font-size: 0.8rem; color: var(--ink4); margin-bottom: 28px; }
    .inv-login-tabs {
      display: flex; gap: 0;
      border-bottom: 1px solid var(--border);
      margin-bottom: 24px;
    }
    .inv-login-tab {
      flex: 1; padding: 10px;
      text-align: center;
      font-size: 0.78rem; font-weight: 600;
      color: var(--ink4);
      background: none; border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: all 0.18s;
      margin-bottom: -1px;
    }
    .inv-login-tab.on { color: var(--ink); border-bottom-color: var(--ink); }
    .inv-login-form { display: flex; flex-direction: column; gap: 14px; }

    /* VENTA */
    .inv-items { padding: 12px 14px; display: flex; flex-direction: column; gap: 7px; }
    .inv-item {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 9px 12px;
      transition: all 0.15s;
      animation: fadeIn 0.2s var(--ease);
    }
    .inv-item:hover { border-color: var(--border2); background: var(--bg2); }
    .inv-item-name { flex: 1; font-size: 0.82rem; font-weight: 500; }
    .inv-item-price { font-size: 0.74rem; color: var(--green); font-family: var(--mono); }

    /* MISC */
    .inv-mono  { font-family: var(--mono); }
    .inv-muted { color: var(--ink3); }
    .inv-green { color: var(--green); }
    .inv-red   { color: var(--red2); }
    .inv-amber { color: var(--amber2); }
    .inv-divider { height: 1px; background: var(--border); }
    .inv-search-wrap { position: relative; }
    .inv-search-ico { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--ink4); pointer-events: none; }
    .inv-search { padding-left: 34px !important; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .inv-spin {
      width: 15px; height: 15px;
      border: 2px solid rgba(0,0,0,0.1);
      border-top-color: var(--green);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }
    .inv-empty { text-align: center; padding: 48px 24px; color: var(--ink4); }
    .inv-empty-ico { font-size: 2rem; margin-bottom: 8px; opacity: 0.35; }
    .inv-empty p { font-size: 0.8rem; }
    .inv-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 40px; color: var(--ink4); font-size: 0.8rem; }

    /* CHAT */
    .inv-chat-wrap { display: flex; flex-direction: column; height: calc(100vh - 190px); max-height: 680px; }
    .inv-chat-msgs { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 14px; }
    .inv-chat-msg { display: flex; gap: 10px; animation: fadeIn 0.2s var(--ease); }
    .inv-chat-msg.user { flex-direction: row-reverse; }
    .inv-chat-av {
      width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 0.78rem;
    }
    .inv-chat-av.ai { background: var(--ink); color: var(--bg); }
    .inv-chat-av.user { background: var(--green3); border: 1px solid rgba(45,158,114,0.2); color: var(--green); }
    .inv-chat-bubble {
      max-width: 74%; padding: 10px 14px; border-radius: 10px;
      font-size: 0.82rem; line-height: 1.65;
    }
    .inv-chat-bubble.ai { background: var(--bg3); border: 1px solid var(--border); color: var(--ink2); border-top-left-radius: 3px; }
    .inv-chat-bubble.user { background: var(--ink); color: var(--bg); border-top-right-radius: 3px; }
    .inv-chat-input-area { padding: 14px 18px; border-top: 1px solid var(--border); display: flex; gap: 10px; background: var(--bg3); }
    .inv-chat-input {
      flex: 1; background: var(--bg2); border: 1.5px solid var(--border2);
      color: var(--ink); padding: 9px 13px; border-radius: 8px;
      font-family: var(--sans); font-size: 0.82rem; outline: none; resize: none;
      min-height: 40px; max-height: 110px; transition: border-color 0.18s;
    }
    .inv-chat-input:focus { border-color: var(--green2); box-shadow: 0 0 0 3px var(--green3); }
    .inv-chat-input::placeholder { color: var(--ink4); }
    .inv-chat-send {
      width: 40px; height: 40px; border-radius: 8px; border: none; cursor: pointer;
      background: var(--ink); color: var(--bg); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.18s;
    }
    .inv-chat-send:hover:not(:disabled) { background: var(--ink2); transform: translateY(-1px); }
    .inv-chat-send:disabled { opacity: 0.35; cursor: not-allowed; }
    .inv-typing { display: flex; gap: 4px; padding: 5px 0; }
    .inv-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--ink3); opacity: 0.4; animation: blink 1.2s infinite; }
    .inv-typing span:nth-child(2) { animation-delay: 0.2s; }
    .inv-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blink { 0%,60%,100%{opacity:0.2;transform:scale(1)} 30%{opacity:1;transform:scale(1.3)} }
    .inv-sugg-bar { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 18px 12px; }
    .inv-sugg {
      padding: 5px 11px; border-radius: 20px; font-size: 0.71rem; cursor: pointer;
      background: var(--bg2); border: 1px solid var(--border2); color: var(--ink2); transition: all 0.15s;
    }
    .inv-sugg:hover { background: var(--green3); border-color: rgba(45,158,114,0.3); color: var(--green); }

    /* MODAL */
    .inv-modal-bg {
      position: fixed; inset: 0; background: rgba(26,25,22,0.55);
      backdrop-filter: blur(4px); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
      animation: fadeIn 0.18s ease;
    }
    .inv-modal {
      width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 12px; box-shadow: 0 24px 64px rgba(0,0,0,0.16);
      animation: riseUp 0.22s var(--ease) both;
    }

    /* TELEGRAM */
    .inv-tg-btn-card {
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: var(--r); overflow: hidden;
      transition: all 0.2s; box-shadow: var(--shadow2);
    }
    .inv-tg-btn-card:hover { border-color: var(--border2); box-shadow: var(--shadow); }
    .inv-log-item {
      padding: 10px 12px; border-radius: var(--r2); font-size: 0.78rem;
      display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;
    }
    .inv-log-ok  { background: var(--green3); border: 1px solid rgba(45,158,114,0.15); color: var(--green); }
    .inv-log-err { background: var(--red3);   border: 1px solid rgba(196,58,37,0.15);  color: var(--red); }

    /* ANIMATIONS */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes riseUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeSlide { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
    .inv-fade { animation: riseUp 0.3s var(--ease) both; }
    .inv-fade-1 { animation-delay: 0.05s; }
    .inv-fade-2 { animation-delay: 0.1s; }
    .inv-fade-3 { animation-delay: 0.15s; }

    /* CHART */
    .inv-bar-chart { display: flex; align-items: flex-end; gap: 5px; height: 130px; }
    .inv-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
    .inv-bar {
      width: 100%; border-radius: 4px 4px 0 0;
      background: var(--ink);
      transition: height 0.4s var(--ease);
    }
    .inv-bar:hover { background: var(--green2); }
    .inv-bar-lbl { font-size: 0.55rem; color: var(--ink4); transform: rotate(-40deg); white-space: nowrap; }
    .inv-bar-val { font-size: 0.58rem; color: var(--ink3); font-family: var(--mono); }

    /* PROGRESS */
    .inv-progress { height: 5px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
    .inv-progress-fill { height: 100%; border-radius: 3px; background: var(--ink); transition: width 0.5s var(--ease); }

    /* ROW DANGER */
    .inv-row-danger td { }
    .inv-row-danger td:nth-child(5) { color: var(--red2) !important; font-weight: 600; }

    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--ink4); }
  `;
  document.head.appendChild(s);
};

// ── SVG ICONS ─────────────────────────────────────────────────────────────────
const Ico = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const Icons = {
  Box:     () => <Ico d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />,
  Cart:    () => <Ico d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />,
  List:    () => <Ico d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  Up:      () => <Ico d="M12 19V5M5 12l7-7 7 7" />,
  Down:    () => <Ico d="M12 5v14M19 12l-7 7-7-7" />,
  Logout:  () => <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  Plus:    () => <Ico d="M12 5v14M5 12h14" />,
  Warn:    () => <Ico d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />,
  Check:   () => <Ico d="M20 6L9 17l-5-5" />,
  Trash:   () => <Ico d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
  Search:  () => <Ico d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />,
  Star:    () => <Ico d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />,
  Brain:   () => <Ico d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.14Z" />,
  Chart:   () => <Ico d="M18 20V10M12 20V4M6 20v-6" />,
  Pdf:     () => <Ico d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6" />,
  Edit:    () => <Ico d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />,
  Truck:   () => <Ico d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />,
  Clock:   () => <Ico d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  Send:    () => <Ico d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  X:       () => <Ico d="M18 6L6 18M6 6l12 12" />,
  Robot:   () => <Ico d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.73V7h2a7 7 0 0 1 7 7v1a2 2 0 0 1-2 2h-1v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2H4a2 2 0 0 1-2-2v-1a7 7 0 0 1 7-7h2V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z" />,
};

// ── ALERT ─────────────────────────────────────────────────────────────────────
function Alert({ msg, type = "ok" }) {
  if (!msg) return null;
  return (
    <div className={`inv-alert inv-alert-${type}`}>
      {type === "ok" ? <Icons.Check /> : <Icons.Warn />}
      {msg}
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleLogin = async e => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const d = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password }) });
      onLogin(d.access_token);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const features = [
    { icon: <Icons.Chart />, text: "Dashboard con métricas en tiempo real" },
    { icon: <Icons.Brain />, text: "Predicción de demanda con inteligencia artificial" },
    { icon: <Icons.Send />, text: "Alertas automáticas por Telegram" },
  ];

  return (
    <div className="inv-login">
      <div className="inv-login-left">
        <div className="inv-login-hero">
          <h1>Inventario<br /><em>Profesional</em></h1>
          <p>Sistema de gestión inteligente para tu negocio</p>
          <div className="inv-login-feats">
            {features.map((f, i) => (
              <div key={i} className="inv-login-feat" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="inv-login-feat-ico">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="inv-login-right">
        <div className="inv-login-form-wrap">
          <h2>Bienvenido</h2>
          <p>Ingresa tus credenciales para acceder al sistema</p>
          <Alert msg={err} type="err" />
          <form className="inv-login-form" onSubmit={handleLogin}>
            <div className="inv-fg">
              <label className="inv-label">Correo electrónico</label>
              <input className="inv-input" type="email" value={form.email} onChange={set("email")} required placeholder="nombre@empresa.com" autoFocus />
            </div>
            <div className="inv-fg">
              <label className="inv-label">Contraseña</label>
              <input className="inv-input" type="password" value={form.password} onChange={set("password")} required placeholder="••••••••" />
            </div>
            <button className="inv-btn inv-btn-primary" type="submit" disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "11px", marginTop: 4 }}>
              {loading ? <span className="inv-spin" /> : "Ingresar →"}
            </button>
          </form>
          <p style={{ marginTop: 20, fontSize: "0.72rem", color: "var(--ink4)", textAlign: "center", lineHeight: 1.6 }}>
            ¿No tienes acceso? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── GESTIÓN DE USUARIOS (solo admin) ─────────────────────────────────────────
function UsuariosTab({ token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState({ msg: "", type: "ok" });
  const [form, setForm] = useState({ nombre: "", email: "", password: "", id_rol: "2" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const cargar = async () => {
    setLoading(true);
    try { setUsuarios(await apiFetch("/auth/usuarios", {}, token)); }
    catch (e) { setAlert({ msg: e.message, type: "err" }); }
    setLoading(false);
  };
  useEffect(() => { cargar(); }, []);

  const handleCrear = async e => {
    e.preventDefault(); setAlert({ msg: "", type: "ok" });
    try {
      await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ ...form, id_rol: parseInt(form.id_rol) }) }, token);
      setAlert({ msg: `Usuario "${form.nombre}" creado correctamente`, type: "ok" });
      setForm({ nombre: "", email: "", password: "", id_rol: "2" });
      setShowForm(false);
      cargar();
    } catch (e) { setAlert({ msg: e.message, type: "err" }); }
  };

  const handleEliminar = async id => {
    if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
    try {
      await apiFetch(`/auth/usuarios/${id}`, { method: "DELETE" }, token);
      setAlert({ msg: "Usuario eliminado", type: "ok" });
      cargar();
    } catch (e) { setAlert({ msg: e.message, type: "err" }); }
  };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Gestión de Usuarios</h2><p>Crea y administra los accesos al sistema</p></div>

      {/* Banner de seguridad */}
      <div className="inv-card" style={{ marginBottom: 18, borderLeft: "3px solid var(--green2)" }}>
        <div style={{ padding: "13px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.3rem" }}>🔒</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.84rem", marginBottom: 1 }}>Registro público desactivado</div>
            <div style={{ fontSize: "0.74rem", color: "var(--ink3)" }}>Solo el administrador puede crear nuevas cuentas. Nadie puede auto-registrarse desde el login.</div>
          </div>
          <span className="inv-badge inv-badge-green" style={{ marginLeft: "auto", flexShrink: 0 }}>Seguro</span>
        </div>
      </div>

      <Alert msg={alert.msg} type={alert.type} />

      <div className="inv-stats" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 18 }}>
        {[
          { lbl: "Total usuarios", val: usuarios.length, color: "#1a1916" },
          { lbl: "Administradores", val: usuarios.filter(u => u.id_rol === 1).length, color: "#1a3f6b" },
          { lbl: "Vendedores", val: usuarios.filter(u => u.id_rol === 2).length, color: "#1a6b4a" },
        ].map(s => (
          <div key={s.lbl} className="inv-stat">
            <div className="inv-stat-accent" style={{ background: s.color }} />
            <div className="inv-stat-lbl">{s.lbl}</div>
            <div className="inv-stat-val">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="inv-card">
        <div className="inv-card-head">
          <div className="inv-card-title"><Icons.Robot /> Usuarios del sistema</div>
          <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={() => setShowForm(!showForm)}>
            <Icons.Plus /> Crear usuario
          </button>
        </div>

        {showForm && (
          <>
            <div style={{ padding: "12px 18px 0" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink3)" }}>Nuevo usuario</span>
            </div>
            <form onSubmit={handleCrear}>
              <div className="inv-form-grid">
                <div className="inv-fg"><label className="inv-label">Nombre completo</label><input className="inv-input" value={form.nombre} onChange={set("nombre")} required placeholder="Juan Pérez" /></div>
                <div className="inv-fg"><label className="inv-label">Correo electrónico</label><input className="inv-input" type="email" value={form.email} onChange={set("email")} required placeholder="juan@empresa.com" /></div>
                <div className="inv-fg"><label className="inv-label">Contraseña</label><input className="inv-input" type="password" value={form.password} onChange={set("password")} required placeholder="Mínimo 6 caracteres" /></div>
                <div className="inv-fg">
                  <label className="inv-label">Rol</label>
                  <select className="inv-select" value={form.id_rol} onChange={set("id_rol")}>
                    <option value="2">Vendedor — acceso básico</option>
                    <option value="1">Administrador — acceso total</option>
                  </select>
                </div>
                <div className="inv-col2" style={{ display: "flex", gap: 8 }}>
                  <button className="inv-btn inv-btn-green" type="submit"><Icons.Check /> Crear usuario</button>
                  <button className="inv-btn inv-btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
              </div>
            </form>
            <div className="inv-divider" />
          </>
        )}

        <div className="inv-table-wrap">
          {loading ? <div className="inv-loading"><span className="inv-spin" /> Cargando...</div> :
            usuarios.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">👤</div><p>No hay usuarios</p></div> : (
              <table className="inv-table">
                <thead><tr><th>#</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acciones</th></tr></thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id_usuario}>
                      <td className="inv-mono" style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{u.id_usuario}</td>
                      <td style={{ fontWeight: 600 }}>{u.nombre}</td>
                      <td style={{ color: "var(--ink3)", fontSize: "0.8rem" }}>{u.email}</td>
                      <td><span className={`inv-badge ${u.id_rol === 1 ? "inv-badge-blue" : "inv-badge-green"}`}>{u.rol}</span></td>
                      <td>
                        <button className="inv-btn-ico" onClick={() => handleEliminar(u.id_usuario)} title="Eliminar usuario">
                          <Icons.Trash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </div>
  );
}

// ── PRODUCTOS ─────────────────────────────────────────────────────────────────
function ProductosTab({ token, isAdmin }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ msg: "", type: "ok" });
  const [showForm, setShowForm] = useState(false);
  const [editProducto, setEditProducto] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio_compra: "", precio_venta: "", stock_actual: "", stock_minimo: "", activo: true });

  const load = useCallback(async () => {
    setLoading(true);
    try { setProductos(await apiFetch("/productos/", {}, token)); }
    catch (e) { setAlert({ msg: e.message, type: "err" }); }
    setLoading(false);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleCreate = async e => {
    e.preventDefault();
    try {
      await apiFetch("/productos/", { method: "POST", body: JSON.stringify({ ...form, precio_compra: parseFloat(form.precio_compra), precio_venta: parseFloat(form.precio_venta), stock_actual: parseInt(form.stock_actual), stock_minimo: parseInt(form.stock_minimo) }) }, token);
      setAlert({ msg: "Producto creado correctamente", type: "ok" });
      setShowForm(false);
      setForm({ nombre: "", descripcion: "", precio_compra: "", precio_venta: "", stock_actual: "", stock_minimo: "", activo: true });
      load();
    } catch (e) { setAlert({ msg: e.message, type: "err" }); }
  };

  const handleDelete = async id => {
    if (!confirm("¿Eliminar este producto?")) return;
    try { await apiFetch(`/productos/${id}`, { method: "DELETE" }, token); setAlert({ msg: "Producto eliminado", type: "ok" }); load(); }
    catch (e) { setAlert({ msg: e.message, type: "err" }); }
  };

  const filtered = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));
  const lowStock = productos.filter(p => p.stock_actual <= p.stock_minimo).length;
  const valorTotal = productos.reduce((s, p) => s + parseFloat(p.precio_venta) * p.stock_actual, 0);

  const stats = [
    { lbl: "Total productos", val: productos.length, sub: `${productos.filter(p => p.activo).length} activos`, color: "#1a1916" },
    { lbl: "Stock bajo", val: lowStock, sub: "Requieren reabastecimiento", color: "#c43a25" },
    { lbl: "Valor inventario", val: `$${valorTotal.toLocaleString("es", { maximumFractionDigits: 0 })}`, sub: "Precio venta total", color: "#1a6b4a" },
    { lbl: "Activos", val: productos.filter(p => p.activo).length, sub: `de ${productos.length} total`, color: "#2d6fad" },
  ];

  return (
    <>
      <div className="inv-fade">
        <div className="inv-ph"><h2>Productos</h2><p>Gestiona el catálogo de tu inventario</p></div>
        <div className="inv-stats">
          {stats.map((s, i) => (
            <div key={s.lbl} className={`inv-stat inv-fade inv-fade-${i}`}>
              <div className="inv-stat-accent" style={{ background: s.color }} />
              <div className="inv-stat-lbl">{s.lbl}</div>
              <div className="inv-stat-val">{s.val}</div>
              <div className="inv-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
        <Alert msg={alert.msg} type={alert.type} />
        <div className="inv-card">
          <div className="inv-card-head">
            <div className="inv-card-title"><Icons.Box /> Catálogo</div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div className="inv-search-wrap">
                <span className="inv-search-ico"><Icons.Search /></span>
                <input className="inv-input inv-search" style={{ width: 200 }} placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {isAdmin && <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={() => setShowForm(!showForm)}><Icons.Plus /> Nuevo</button>}
            </div>
          </div>
          {showForm && isAdmin && (
            <>
              <div style={{ padding: "14px 18px 0", borderBottom: "none" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink3)" }}>Nuevo producto</span>
              </div>
              <form onSubmit={handleCreate}>
                <div className="inv-form-grid">
                  <div className="inv-fg"><label className="inv-label">Nombre</label><input className="inv-input" value={form.nombre} onChange={set("nombre")} required placeholder="Nombre del producto" /></div>
                  <div className="inv-fg"><label className="inv-label">Descripción</label><input className="inv-input" value={form.descripcion} onChange={set("descripcion")} placeholder="Opcional" /></div>
                  <div className="inv-fg"><label className="inv-label">Precio compra</label><input className="inv-input" type="number" step="0.01" min="0" value={form.precio_compra} onChange={set("precio_compra")} required placeholder="0.00" /></div>
                  <div className="inv-fg"><label className="inv-label">Precio venta</label><input className="inv-input" type="number" step="0.01" min="0" value={form.precio_venta} onChange={set("precio_venta")} required placeholder="0.00" /></div>
                  <div className="inv-fg"><label className="inv-label">Stock inicial</label><input className="inv-input" type="number" min="0" value={form.stock_actual} onChange={set("stock_actual")} required placeholder="0" /></div>
                  <div className="inv-fg"><label className="inv-label">Stock mínimo</label><input className="inv-input" type="number" min="0" value={form.stock_minimo} onChange={set("stock_minimo")} required placeholder="5" /></div>
                  <div className="inv-col2" style={{ display: "flex", gap: 8 }}>
                    <button className="inv-btn inv-btn-green" type="submit"><Icons.Check /> Guardar</button>
                    <button className="inv-btn inv-btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                  </div>
                </div>
              </form>
              <div className="inv-divider" />
            </>
          )}
          <div className="inv-table-wrap">
            {loading ? <div className="inv-loading"><span className="inv-spin" /> Cargando...</div> :
              filtered.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">📦</div><p>{search ? "Sin resultados" : "No hay productos"}</p></div> : (
                <table className="inv-table">
                  <thead>
                    <tr><th>#</th><th>Producto</th><th>P. Compra</th><th>P. Venta</th><th>Stock</th><th>Mín.</th><th>Estado</th>{isAdmin && <th>Acciones</th>}</tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id_producto} className={p.stock_actual <= p.stock_minimo ? "inv-row-danger" : ""}>
                        <td className="inv-mono" style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{p.id_producto}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: "0.83rem" }}>{p.nombre}</div>
                          {p.descripcion && <div style={{ fontSize: "0.72rem", color: "var(--ink4)", marginTop: 1 }}>{p.descripcion}</div>}
                        </td>
                        <td className="inv-mono" style={{ color: "var(--ink3)" }}>${parseFloat(p.precio_compra).toFixed(2)}</td>
                        <td className="inv-mono" style={{ color: "var(--green)", fontWeight: 600 }}>${parseFloat(p.precio_venta).toFixed(2)}</td>
                        <td>{p.stock_actual <= p.stock_minimo
                          ? <span className="inv-badge inv-badge-red">⚠ {p.stock_actual}</span>
                          : <span className="inv-mono" style={{ fontWeight: 600 }}>{p.stock_actual}</span>}
                        </td>
                        <td className="inv-mono inv-muted">{p.stock_minimo}</td>
                        <td><span className={`inv-badge ${p.activo ? "inv-badge-green" : "inv-badge-gray"}`}>{p.activo ? "Activo" : "Inactivo"}</span></td>
                        {isAdmin && (
                          <td>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button className="inv-btn-ico inv-btn-ico-edit" onClick={() => setEditProducto(p)} title="Editar"><Icons.Edit /></button>
                              <button className="inv-btn-ico" onClick={() => handleDelete(p.id_producto)} title="Eliminar"><Icons.Trash /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>
      </div>
      {editProducto && (
        <EditarProductoModal
          producto={editProducto} token={token}
          onClose={() => setEditProducto(null)}
          onSaved={() => { setEditProducto(null); setAlert({ msg: "Producto actualizado", type: "ok" }); load(); }}
        />
      )}
    </>
  );
}

// ── EDITAR MODAL ──────────────────────────────────────────────────────────────
function EditarProductoModal({ producto, token, onClose, onSaved }) {
  const [form, setForm] = useState({ ...producto });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleSave = async e => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      await apiFetch(`/productos/${producto.id_producto}`, { method: "PUT", body: JSON.stringify({ ...form, precio_compra: parseFloat(form.precio_compra), precio_venta: parseFloat(form.precio_venta), stock_actual: parseInt(form.stock_actual), stock_minimo: parseInt(form.stock_minimo) }) }, token);
      onSaved();
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div className="inv-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="inv-modal">
        <div className="inv-card-head">
          <div className="inv-card-title"><Icons.Edit /> Editar producto</div>
          <button className="inv-btn-ico" onClick={onClose}><Icons.X /></button>
        </div>
        {err && <div style={{ padding: "14px 18px 0" }}><Alert msg={err} type="err" /></div>}
        <form onSubmit={handleSave}>
          <div className="inv-form-grid">
            <div className="inv-fg"><label className="inv-label">Nombre</label><input className="inv-input" value={form.nombre} onChange={set("nombre")} required /></div>
            <div className="inv-fg"><label className="inv-label">Descripción</label><input className="inv-input" value={form.descripcion || ""} onChange={set("descripcion")} /></div>
            <div className="inv-fg"><label className="inv-label">Precio compra</label><input className="inv-input" type="number" step="0.01" min="0" value={form.precio_compra} onChange={set("precio_compra")} required /></div>
            <div className="inv-fg"><label className="inv-label">Precio venta</label><input className="inv-input" type="number" step="0.01" min="0" value={form.precio_venta} onChange={set("precio_venta")} required /></div>
            <div className="inv-fg"><label className="inv-label">Stock actual</label><input className="inv-input" type="number" min="0" value={form.stock_actual} onChange={set("stock_actual")} required /></div>
            <div className="inv-fg"><label className="inv-label">Stock mínimo</label><input className="inv-input" type="number" min="0" value={form.stock_minimo} onChange={set("stock_minimo")} required /></div>
            <div className="inv-fg" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={form.activo} onChange={set("activo")} id="activo-edit" style={{ width: 16, height: 16, accentColor: "var(--green)" }} />
              <label className="inv-label" htmlFor="activo-edit" style={{ textTransform: "none", letterSpacing: 0 }}>Producto activo</label>
            </div>
            <div className="inv-col2" style={{ display: "flex", gap: 8 }}>
              <button className="inv-btn inv-btn-green" type="submit" disabled={loading}>{loading ? <span className="inv-spin" /> : <><Icons.Check /> Guardar cambios</>}</button>
              <button className="inv-btn inv-btn-ghost" type="button" onClick={onClose}>Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── VENTAS ────────────────────────────────────────────────────────────────────
function VentasTab({ token, userId }) {
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([]);
  const [alert, setAlert] = useState({ msg: "", type: "ok" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { apiFetch("/productos/", {}, token).then(setProductos).catch(console.error); }, [token]);

  const addItem = id => {
    const p = productos.find(x => x.id_producto === parseInt(id));
    if (!p) return;
    setItems(prev => {
      const ex = prev.find(i => i.id_producto === p.id_producto);
      if (ex) return prev.map(i => i.id_producto === p.id_producto ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { id_producto: p.id_producto, nombre: p.nombre, precio_venta: p.precio_venta, cantidad: 1 }];
    });
  };
  const removeItem = id => setItems(p => p.filter(i => i.id_producto !== id));
  const setCant = (id, v) => setItems(p => p.map(i => i.id_producto === id ? { ...i, cantidad: Math.max(1, parseInt(v) || 1) } : i));
  const total = items.reduce((s, i) => s + parseFloat(i.precio_venta) * i.cantidad, 0);

  const handleVenta = async () => {
    if (!items.length) return setAlert({ msg: "Agrega al menos un producto", type: "err" });
    setLoading(true);
    try {
      const d = await apiFetch("/ventas/", { method: "POST", body: JSON.stringify({ id_usuario: userId, detalles: items.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })) }) }, token);
      setAlert({ msg: `✓ Venta #${d.id_venta} registrada — Total: $${parseFloat(d.total).toFixed(2)}`, type: "ok" });
      setItems([]);
    } catch (e) { setAlert({ msg: e.message, type: "err" }); }
    setLoading(false);
  };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Nueva Venta</h2><p>Registra una venta y actualiza el inventario automáticamente</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "18px", alignItems: "start" }}>
        <div className="inv-card">
          <div className="inv-card-head">
            <div className="inv-card-title"><Icons.Cart /> Seleccionar productos</div>
            <span style={{ fontSize: "0.72rem", color: "var(--ink4)", fontWeight: 500 }}>{items.length} ítem{items.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="inv-fg">
              <label className="inv-label">Agregar producto</label>
              <select className="inv-select" onChange={e => { addItem(e.target.value); e.target.value = ""; }} defaultValue="">
                <option value="" disabled>Selecciona un producto...</option>
                {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre} — ${parseFloat(p.precio_venta).toFixed(2)} (stock: {p.stock_actual})</option>)}
              </select>
            </div>
          </div>
          {items.length === 0 ? (
            <div className="inv-empty"><div className="inv-empty-ico">🛒</div><p>Selecciona productos para agregar</p></div>
          ) : (
            <div className="inv-items">
              {items.map(i => (
                <div key={i.id_producto} className="inv-item">
                  <div className="inv-item-name">{i.nombre}</div>
                  <div className="inv-item-price">${parseFloat(i.precio_venta).toFixed(2)} c/u</div>
                  <input className="inv-input" type="number" min="1" value={i.cantidad} onChange={e => setCant(i.id_producto, e.target.value)} style={{ width: 64 }} />
                  <span className="inv-mono" style={{ fontSize: "0.8rem", color: "var(--green)", fontWeight: 600, minWidth: 70, textAlign: "right" }}>${(parseFloat(i.precio_venta) * i.cantidad).toFixed(2)}</span>
                  <button className="inv-btn-ico" onClick={() => removeItem(i.id_producto)}><Icons.Trash /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: 76 }}>
          <Alert msg={alert.msg} type={alert.type} />
          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title"><Icons.Star /> Resumen</div></div>
            <div style={{ padding: "16px" }}>
              {items.length === 0 ? <p style={{ color: "var(--ink4)", fontSize: "0.8rem", textAlign: "center", padding: "12px 0" }}>Sin productos</p> : (
                <>
                  {items.map(i => (
                    <div key={i.id_producto} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--ink3)" }}>{i.nombre} ×{i.cantidad}</span>
                      <span className="inv-mono" style={{ fontWeight: 600 }}>${(parseFloat(i.precio_venta) * i.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
                </>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink4)" }}>Total</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: "2rem", fontWeight: 600, color: "var(--green)", letterSpacing: "-0.02em" }}>${total.toFixed(2)}</span>
              </div>
              <button className="inv-btn inv-btn-green" onClick={handleVenta} disabled={loading || !items.length} style={{ width: "100%", justifyContent: "center", padding: "11px" }}>
                {loading ? <span className="inv-spin" /> : <><Icons.Check /> Confirmar venta</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MOVIMIENTOS ───────────────────────────────────────────────────────────────
function MovimientosTab({ token, isAdmin }) {
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMov, setLoadingMov] = useState(false);
  const [form, setForm] = useState({ id_producto: "", cantidad: "", motivo: "", tipo: "entrada" });
  const [alert, setAlert] = useState({ msg: "", type: "ok" });

  useEffect(() => {
    apiFetch("/productos/", {}, token).then(setProductos).catch(console.error);
    if (isAdmin) { setLoadingMov(true); apiFetch("/movimientos/", {}, token).then(m => { setMovimientos(m); setLoadingMov(false); }).catch(() => setLoadingMov(false)); }
  }, [token, isAdmin]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const path = form.tipo === "entrada" ? "/movimientos/entrada" : "/movimientos/salida";
    try {
      await apiFetch(path, { method: "POST", body: JSON.stringify({ id_producto: parseInt(form.id_producto), cantidad: parseInt(form.cantidad), motivo: form.motivo }) }, token);
      setAlert({ msg: `Movimiento de ${form.tipo} registrado`, type: "ok" });
      setForm({ id_producto: "", cantidad: "", motivo: "", tipo: form.tipo });
      if (isAdmin) apiFetch("/movimientos/", {}, token).then(setMovimientos);
    } catch (e) { setAlert({ msg: e.message, type: "err" }); }
  };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Movimientos</h2><p>Registra entradas y salidas de inventario</p></div>
      <Alert msg={alert.msg} type={alert.type} />
      {isAdmin && (
        <div className="inv-stats" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
          {[
            { lbl: "Total", val: movimientos.length, color: "#1a1916" },
            { lbl: "Entradas", val: movimientos.filter(m => m.tipo === "ENTRADA").length, color: "#1a6b4a" },
            { lbl: "Salidas", val: movimientos.filter(m => m.tipo === "SALIDA").length, color: "#c43a25" },
          ].map(s => (
            <div key={s.lbl} className="inv-stat">
              <div className="inv-stat-accent" style={{ background: s.color }} />
              <div className="inv-stat-lbl">{s.lbl}</div>
              <div className="inv-stat-val">{s.val}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "300px 1fr" : "1fr", gap: 18 }}>
        <div className="inv-card" style={{ alignSelf: "start" }}>
          <div className="inv-card-head"><div className="inv-card-title">{form.tipo === "entrada" ? <Icons.Up /> : <Icons.Down />} Registrar movimiento</div></div>
          <form onSubmit={handleSubmit}>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              {isAdmin && (
                <div className="inv-fg">
                  <label className="inv-label">Tipo</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {["entrada", "salida"].map(t => (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tipo: t }))}
                        className={`inv-btn ${form.tipo === t ? "inv-btn-primary" : "inv-btn-ghost"}`}
                        style={{ justifyContent: "center" }}>
                        {t === "entrada" ? <Icons.Up /> : <Icons.Down />}
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="inv-fg"><label className="inv-label">Producto</label>
                <select className="inv-select" value={form.id_producto} onChange={set("id_producto")} required>
                  <option value="">Seleccionar...</option>
                  {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre} (stock: {p.stock_actual})</option>)}
                </select>
              </div>
              <div className="inv-fg"><label className="inv-label">Cantidad</label><input className="inv-input" type="number" min="1" value={form.cantidad} onChange={set("cantidad")} required placeholder="0" /></div>
              <div className="inv-fg"><label className="inv-label">Motivo</label><input className="inv-input" value={form.motivo} onChange={set("motivo")} required placeholder="Ej: Compra a proveedor" /></div>
              <button className="inv-btn inv-btn-green" type="submit" style={{ justifyContent: "center" }}><Icons.Check /> Registrar</button>
            </div>
          </form>
        </div>
        {isAdmin && (
          <div className="inv-card">
            <div className="inv-card-head">
              <div className="inv-card-title"><Icons.List /> Historial</div>
              <span style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{movimientos.length} registros</span>
            </div>
            <div className="inv-table-wrap">
              {loadingMov ? <div className="inv-loading"><span className="inv-spin" /> Cargando...</div> :
                movimientos.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">📋</div><p>Sin movimientos</p></div> : (
                  <table className="inv-table">
                    <thead><tr><th>#</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo</th></tr></thead>
                    <tbody>
                      {movimientos.map(m => (
                        <tr key={m.id_movimiento}>
                          <td className="inv-mono" style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{m.id_movimiento}</td>
                          <td style={{ color: "var(--ink3)" }}>Prod. #{m.id_producto}</td>
                          <td><span className={`inv-badge ${m.tipo === "ENTRADA" ? "inv-badge-green" : "inv-badge-red"}`}>{m.tipo}</span></td>
                          <td className="inv-mono" style={{ fontWeight: 600 }}>{m.cantidad}</td>
                          <td style={{ color: "var(--ink3)", fontSize: "0.78rem" }}>{m.motivo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ASISTENTE IA ──────────────────────────────────────────────────────────────
function AsistenteIATab({ token }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "¡Hola! Soy tu asistente de inventario con IA.\n\nPuedo ayudarte a analizar tu inventario, sugerir estrategias, identificar productos con bajo stock y mucho más. ¿En qué te ayudo?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const endRef = useRef(null);

  useEffect(() => { apiFetch("/productos/", {}, token).then(setProductos).catch(console.error); }, [token]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sugerencias = ["¿Qué productos tienen stock bajo?", "¿Cuáles son los más rentables?", "Analiza el valor del inventario", "¿Qué debo reabastecer pronto?"];

  const buildContext = () => {
    if (!productos.length) return "No hay productos.";
    const resumen = productos.map(p => `- ${p.nombre}: stock=${p.stock_actual}, mínimo=${p.stock_minimo}, precio_venta=$${p.precio_venta}`).join("\n");
    const valorTotal = productos.reduce((s, p) => s + parseFloat(p.precio_venta) * p.stock_actual, 0);
    const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo);
    return `INVENTARIO (${productos.length} productos, valor: $${valorTotal.toFixed(2)}):\n${resumen}\nSTOCK BAJO: ${stockBajo.map(p => p.nombre).join(", ") || "ninguno"}`;
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const historial = newMessages.slice(1, -1).map(m => ({ role: m.role, content: m.content }));
      const response = await apiFetch("/ia/chat", { method: "POST", body: JSON.stringify({ messages: [...historial, { role: "user", content: msg }], contexto_inventario: buildContext() }) }, token);
      setMessages(prev => [...prev, { role: "assistant", content: response.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ Error al conectar con la IA." }]);
    }
    setLoading(false);
  };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Asistente IA</h2><p>Consulta y analiza tu inventario con inteligencia artificial</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 18 }}>
        <div className="inv-card inv-chat-wrap">
          <div className="inv-card-head">
            <div className="inv-card-title"><Icons.Robot /> Asistente</div>
            <span style={{ fontSize: "0.68rem", color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green2)", display: "inline-block", boxShadow: "0 0 0 2px var(--green3)" }} />
              En línea
            </span>
          </div>
          <div className="inv-chat-msgs">
            {messages.map((m, i) => (
              <div key={i} className={`inv-chat-msg ${m.role === "user" ? "user" : ""}`}>
                <div className={`inv-chat-av ${m.role === "assistant" ? "ai" : "user"}`}>{m.role === "assistant" ? "✦" : "👤"}</div>
                <div className={`inv-chat-bubble ${m.role === "assistant" ? "ai" : "user"}`}>
                  {m.content.split("\n").map((l, j) => <span key={j}>{l}{j < m.content.split("\n").length - 1 && <br />}</span>)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="inv-chat-msg">
                <div className="inv-chat-av ai">✦</div>
                <div className="inv-chat-bubble ai"><div className="inv-typing"><span /><span /><span /></div></div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          {messages.length <= 1 && (
            <div className="inv-sugg-bar">
              {sugerencias.map((s, i) => <button key={i} className="inv-sugg" onClick={() => sendMessage(s)}>{s}</button>)}
            </div>
          )}
          <div className="inv-chat-input-area">
            <textarea className="inv-chat-input" placeholder="Escribe tu pregunta... (Enter para enviar)" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} rows={1} />
            <button className="inv-chat-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              {loading ? <span className="inv-spin" style={{ width: 14, height: 14 }} /> : <Icons.Send />}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title" style={{ fontSize: "0.7rem" }}>Resumen rápido</div></div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { lbl: "Productos", val: productos.length, color: "var(--ink)" },
                { lbl: "Stock bajo", val: productos.filter(p => p.stock_actual <= p.stock_minimo).length, color: "var(--red2)" },
                { lbl: "Valor total", val: `$${productos.reduce((s, p) => s + parseFloat(p.precio_venta) * p.stock_actual, 0).toLocaleString("es", { maximumFractionDigits: 0 })}`, color: "var(--green)" },
              ].map(({ lbl, val, color }) => (
                <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.74rem", color: "var(--ink4)" }}>{lbl}</span>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color, fontSize: "0.88rem" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title" style={{ fontSize: "0.7rem" }}>Sugerencias</div></div>
            <div style={{ padding: "8px" }}>
              {["¿Qué debo comprar esta semana?", "¿Cuál es mi margen promedio?", "¿Cómo optimizar el stock mínimo?", "Identifica oportunidades"].map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} style={{
                  display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 3,
                  borderRadius: 7, border: "1px solid var(--border)", background: "none", color: "var(--ink3)",
                  fontSize: "0.74rem", cursor: "pointer", transition: "all 0.15s"
                }}
                  onMouseEnter={e => { e.target.style.background = "var(--green3)"; e.target.style.color = "var(--green)"; e.target.style.borderColor = "rgba(45,158,114,0.25)"; }}
                  onMouseLeave={e => { e.target.style.background = "none"; e.target.style.color = "var(--ink3)"; e.target.style.borderColor = "var(--border)"; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { apiFetch("/reportes/dashboard", {}, token).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [token]);

  if (loading) return <div className="inv-loading"><span className="inv-spin" /> Cargando dashboard...</div>;
  if (error) return <Alert msg={error} type="err" />;
  if (!data) return null;

  const { resumen, ventas_por_dia, top_productos, stock_bajo_lista, distribucion_stock } = data;
  const maxVenta = Math.max(...ventas_por_dia.map(d => d.total), 1);
  const maxTop = Math.max(...top_productos.map(d => d.total_vendido), 1);
  const maxStock = Math.max(...distribucion_stock.map(d => d.stock), 1);

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Dashboard</h2><p>Resumen general del negocio</p></div>
      <div className="inv-stats">
        {[
          { lbl: "Ventas este mes", val: resumen.ventas_mes_cantidad, sub: `$${resumen.ventas_mes_total.toLocaleString("es", { maximumFractionDigits: 0 })} en ingresos`, color: "#1a1916" },
          { lbl: "Esta semana", val: resumen.ventas_semana_cantidad, sub: `$${resumen.ventas_semana_total.toLocaleString("es", { maximumFractionDigits: 0 })} en ingresos`, color: "#2d6fad" },
          { lbl: "Valor inventario", val: `$${resumen.valor_inventario.toLocaleString("es", { maximumFractionDigits: 0 })}`, sub: `${resumen.productos_activos} productos activos`, color: "#1a6b4a" },
          { lbl: "Alertas stock", val: resumen.stock_bajo, sub: "Productos a reabastecer", color: "#c43a25" },
        ].map((s, i) => (
          <div key={s.lbl} className={`inv-stat inv-fade inv-fade-${i}`}>
            <div className="inv-stat-accent" style={{ background: s.color }} />
            <div className="inv-stat-lbl">{s.lbl}</div>
            <div className="inv-stat-val">{s.val}</div>
            <div className="inv-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <div className="inv-card">
          <div className="inv-card-head"><div className="inv-card-title"><Icons.Chart /> Ventas últimos 14 días</div></div>
          <div style={{ padding: "16px 18px" }}>
            {ventas_por_dia.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">📊</div><p>Sin datos</p></div> : (
              <div className="inv-bar-chart">
                {ventas_por_dia.map((d, i) => (
                  <div key={i} className="inv-bar-wrap" title={`${d.dia}: $${d.total.toFixed(2)}`}>
                    <div className="inv-bar-val">{d.total > 999 ? (d.total / 1000).toFixed(1) + "k" : d.total.toFixed(0)}</div>
                    <div className="inv-bar" style={{ height: `${Math.max(4, (d.total / maxVenta) * 100)}%` }} />
                    <div className="inv-bar-lbl">{d.dia.slice(5)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="inv-card">
          <div className="inv-card-head"><div className="inv-card-title"><Icons.Star /> Top productos vendidos</div></div>
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
            {top_productos.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">🏆</div><p>Sin datos</p></div> :
              top_productos.map((p, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{p.nombre}</span>
                    <span className="inv-mono" style={{ fontSize: "0.74rem", color: "var(--green)", fontWeight: 600 }}>{p.total_vendido} uds</span>
                  </div>
                  <div className="inv-progress">
                    <div className="inv-progress-fill" style={{ width: `${(p.total_vendido / maxTop) * 100}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="inv-card">
          <div className="inv-card-head"><div className="inv-card-title"><Icons.Box /> Distribución de stock</div></div>
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {distribucion_stock.map((p, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.78rem" }}>{p.nombre}</span>
                  <span className="inv-mono" style={{ fontSize: "0.74rem", color: "var(--ink2)", fontWeight: 600 }}>{p.stock}</span>
                </div>
                <div className="inv-progress">
                  <div className="inv-progress-fill" style={{ width: `${(p.stock / maxStock) * 100}%`, background: "var(--green2)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="inv-card">
          <div className="inv-card-head">
            <div className="inv-card-title"><Icons.Warn /> Alertas de stock</div>
            <span className="inv-badge inv-badge-red">{stock_bajo_lista.length}</span>
          </div>
          <div className="inv-table-wrap">
            {stock_bajo_lista.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">✅</div><p>Todo en orden</p></div> : (
              <table className="inv-table">
                <thead><tr><th>Producto</th><th>Stock</th><th>Mín.</th></tr></thead>
                <tbody>
                  {stock_bajo_lista.map((p, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontSize: "0.8rem" }}>{p.nombre}</td>
                      <td><span className="inv-badge inv-badge-red">{p.stock_actual}</span></td>
                      <td className="inv-mono inv-muted">{p.stock_minimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PREDICCIÓN ────────────────────────────────────────────────────────────────
function PrediccionTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { apiFetch("/reportes/prediccion", {}, token).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [token]);

  if (loading) return <div className="inv-loading"><span className="inv-spin" /> Analizando datos...</div>;
  if (error) return <Alert msg={error} type="err" />;
  if (!data) return null;

  const urg = {
    critica: { badge: "inv-badge-red",   label: "Crítico" },
    alta:    { badge: "inv-badge-amber",  label: "Alta" },
    media:   { badge: "inv-badge-blue",   label: "Media" },
    ok:      { badge: "inv-badge-green",  label: "OK" },
  };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Predicción de Demanda</h2><p>Análisis inteligente para los próximos 30 días</p></div>
      <div className="inv-stats" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 20 }}>
        {[
          { lbl: "Productos críticos", val: data.resumen.criticos, sub: "Menos de 7 días de stock", color: "#c43a25" },
          { lbl: "Alta prioridad", val: data.resumen.alta_prioridad, sub: "Menos de 15 días", color: "#92520a" },
          { lbl: "Inversión urgente", val: `$${data.resumen.costo_urgente.toLocaleString("es", { maximumFractionDigits: 0 })}`, sub: "Reposición inmediata", color: "#1a6b4a" },
        ].map(s => (
          <div key={s.lbl} className="inv-stat">
            <div className="inv-stat-accent" style={{ background: s.color }} />
            <div className="inv-stat-lbl">{s.lbl}</div>
            <div className="inv-stat-val">{s.val}</div>
            <div className="inv-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="inv-card">
        <div className="inv-card-head"><div className="inv-card-title"><Icons.Brain /> Predicciones por producto</div></div>
        <div className="inv-table-wrap">
          {data.predicciones.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">📈</div><p>Insuficientes datos de ventas</p></div> : (
            <table className="inv-table">
              <thead>
                <tr><th>Producto</th><th>Stock</th><th>Vendido/30d</th><th>Días restantes</th><th>Tendencia</th><th>Comprar</th><th>Costo</th><th>Urgencia</th></tr>
              </thead>
              <tbody>
                {data.predicciones.map((p, i) => {
                  const cfg = urg[p.urgencia];
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontSize: "0.82rem" }}>{p.nombre}</td>
                      <td className="inv-mono">{p.stock_actual}</td>
                      <td className="inv-mono">{p.vendido_30d}</td>
                      <td className="inv-mono" style={{ fontWeight: 700, color: p.urgencia === "critica" ? "var(--red2)" : p.urgencia === "alta" ? "var(--amber2)" : "var(--ink)" }}>
                        {p.dias_stock_restante >= 999 ? "∞" : `${p.dias_stock_restante}d`}
                      </td>
                      <td className="inv-mono" style={{ color: p.tendencia_pct >= 0 ? "var(--green2)" : "var(--red2)" }}>
                        {p.tendencia_pct >= 0 ? "↑" : "↓"} {Math.abs(p.tendencia_pct)}%
                      </td>
                      <td className="inv-mono" style={{ fontWeight: 700, color: p.cantidad_recomendada > 0 ? "var(--amber2)" : "var(--ink4)" }}>
                        {p.cantidad_recomendada > 0 ? `+${p.cantidad_recomendada}` : "—"}
                      </td>
                      <td className="inv-mono" style={{ color: "var(--green)" }}>${p.costo_reposicion.toFixed(2)}</td>
                      <td><span className={`inv-badge ${cfg.badge}`}>{cfg.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── REPORTE PDF ───────────────────────────────────────────────────────────────
function ReportePDFTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { apiFetch("/reportes/pdf-data", {}, token).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false)); }, [token]);

  const generarPDF = () => {
    if (!data) return;
    setGenerando(true);
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte</title><style>
      body{font-family:Arial,sans-serif;color:#1a1916;margin:0}
      .h{background:#1a1916;color:#f7f6f3;padding:32px 40px}
      .h h1{margin:0 0 4px;font-size:24px} .h p{margin:0;opacity:.6;font-size:12px}
      .c{padding:32px 40px}
      .sg{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
      .s{background:#f7f6f3;border-radius:8px;padding:16px;text-align:center;border:1px solid #e4e2da}
      .sv{font-size:24px;font-weight:700;color:#1a6b4a} .sl{font-size:10px;color:#9e9b92;text-transform:uppercase;letter-spacing:.1em;margin-top:4px}
      h2{font-size:13px;font-weight:700;margin:24px 0 10px;text-transform:uppercase;letter-spacing:.08em;color:#3d3b35}
      table{width:100%;border-collapse:collapse;font-size:11px}
      th{background:#f0efe9;padding:7px 10px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#9e9b92;border-bottom:1px solid #e4e2da}
      td{padding:8px 10px;border-bottom:1px solid #f0efe9}
      .ok{background:#e8f5ef;color:#1a6b4a;padding:2px 7px;border-radius:3px;font-size:9px;font-weight:700}
      .wa{background:#fdecea;color:#8b2215;padding:2px 7px;border-radius:3px;font-size:9px;font-weight:700}
      .ft{margin-top:36px;padding-top:14px;border-top:1px solid #e4e2da;font-size:10px;color:#9e9b92;text-align:center}
    </style></head><body>
    <div class="h"><h1>Inventario Profesional — Reporte General</h1><p>Período: ${data.periodo} | Generado: ${data.fecha_generacion}</p></div>
    <div class="c">
      <div class="sg">
        <div class="s"><div class="sv">${data.resumen.total_productos}</div><div class="sl">Productos</div></div>
        <div class="s"><div class="sv">$${data.resumen.valor_inventario.toLocaleString("es", { maximumFractionDigits: 0 })}</div><div class="sl">Valor inventario</div></div>
        <div class="s"><div class="sv">${data.resumen.total_ventas_mes}</div><div class="sl">Ventas del mes</div></div>
        <div class="s"><div class="sv">$${data.resumen.ingreso_mes.toLocaleString("es", { maximumFractionDigits: 0 })}</div><div class="sl">Ingreso del mes</div></div>
      </div>
      <h2>Top productos vendidos</h2>
      <table><thead><tr><th>#</th><th>Producto</th><th>Unidades</th><th>Ingreso</th></tr></thead><tbody>
        ${data.top_productos.map((p, i) => `<tr><td>${i + 1}</td><td><strong>${p.nombre}</strong></td><td>${p.total_vendido}</td><td>$${p.ingreso.toFixed(2)}</td></tr>`).join("")}
      </tbody></table>
      <h2>Estado del inventario</h2>
      <table><thead><tr><th>Producto</th><th>Stock</th><th>Mín.</th><th>P. Venta</th><th>Valor</th><th>Estado</th></tr></thead><tbody>
        ${data.productos.map(p => `<tr><td><strong>${p.nombre}</strong></td><td>${p.stock_actual}</td><td>${p.stock_minimo}</td><td>$${p.precio_venta.toFixed(2)}</td><td>$${p.valor_stock.toFixed(2)}</td><td><span class="${p.stock_actual <= p.stock_minimo ? "wa" : "ok"}">${p.estado}</span></td></tr>`).join("")}
      </tbody></table>
      <div class="ft">Inventario Profesional | ${data.fecha_generacion}</div>
    </div></body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html); w.document.close(); w.focus();
    setTimeout(() => { w.print(); setGenerando(false); }, 800);
  };

  if (loading) return <div className="inv-loading"><span className="inv-spin" /> Preparando reporte...</div>;
  if (error) return <Alert msg={error} type="err" />;
  if (!data) return null;

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Reporte PDF</h2><p>Genera un reporte completo del inventario</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="inv-card">
          <div className="inv-card-head"><div className="inv-card-title"><Icons.Pdf /> Generar reporte</div></div>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 16 }}>
              <div style={{ width: 64, height: 64, background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>📄</div>
              <p style={{ color: "var(--ink3)", fontSize: "0.82rem", textAlign: "center", lineHeight: 1.6, maxWidth: 320 }}>
                Genera un PDF con el resumen del inventario, top productos y estado de stock del período actual.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, width: "100%" }}>
                {[{ lbl: "Productos", val: data.resumen.total_productos }, { lbl: "Ventas", val: data.resumen.total_ventas_mes }, { lbl: "Stock bajo", val: data.resumen.productos_stock_bajo }].map(s => (
                  <div key={s.lbl} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 600 }}>{s.val}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
              <button className="inv-btn inv-btn-primary" onClick={generarPDF} disabled={generando} style={{ padding: "10px 28px" }}>
                {generando ? <><span className="inv-spin" /> Generando...</> : <><Icons.Pdf /> Generar y descargar</>}
              </button>
              <p style={{ fontSize: "0.7rem", color: "var(--ink4)" }}>Se abrirá el diálogo de impresión para guardar como PDF</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title"><Icons.Star /> Top productos</div></div>
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead><tr><th>#</th><th>Producto</th><th>Vendido</th><th>Ingreso</th></tr></thead>
                <tbody>
                  {data.top_productos.map((p, i) => (
                    <tr key={i}>
                      <td className="inv-mono" style={{ color: "var(--ink4)", fontSize: "0.72rem" }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                      <td className="inv-mono">{p.total_vendido}</td>
                      <td className="inv-mono" style={{ color: "var(--green)", fontWeight: 600 }}>${p.ingreso.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HISTORIAL VENTAS ──────────────────────────────────────────────────────────
function HistorialVentasTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [expandido, setExpandido] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append("fecha_inicio", fechaInicio);
      if (fechaFin) params.append("fecha_fin", fechaFin);
      setData(await apiFetch(`/historial-ventas/?${params}`, {}, token));
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { cargar(); }, []);

  const fmt = iso => { if (!iso) return "—"; const d = new Date(iso); return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Historial de Ventas</h2><p>Consulta y filtra el registro completo de ventas</p></div>
      <div className="inv-card" style={{ marginBottom: 18 }}>
        <div className="inv-card-head"><div className="inv-card-title"><Icons.Clock /> Filtros</div></div>
        <div style={{ padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="inv-fg"><label className="inv-label">Fecha inicio</label><input className="inv-input" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} /></div>
          <div className="inv-fg"><label className="inv-label">Fecha fin</label><input className="inv-input" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} /></div>
          <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={cargar} disabled={loading}>{loading ? <span className="inv-spin" /> : <><Icons.Search /> Buscar</>}</button>
          <button className="inv-btn inv-btn-ghost inv-btn-sm" onClick={() => { setFechaInicio(""); setFechaFin(""); setTimeout(cargar, 0); }}>Limpiar</button>
        </div>
      </div>
      {data && (
        <div className="inv-stats" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 18 }}>
          {[
            { lbl: "Total ventas", val: data.total_registros, color: "#1a1916" },
            { lbl: "Ingresos período", val: `$${data.total_periodo.toLocaleString("es", { maximumFractionDigits: 2 })}`, color: "#1a6b4a" },
            { lbl: "Ticket promedio", val: `$${data.total_registros > 0 ? (data.total_periodo / data.total_registros).toFixed(2) : "0.00"}`, color: "#2d6fad" },
          ].map(s => (
            <div key={s.lbl} className="inv-stat">
              <div className="inv-stat-accent" style={{ background: s.color }} />
              <div className="inv-stat-lbl">{s.lbl}</div>
              <div className="inv-stat-val" style={{ fontSize: "1.8rem" }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}
      <div className="inv-card">
        <div className="inv-card-head">
          <div className="inv-card-title"><Icons.Cart /> Registro de ventas</div>
          {data && <span style={{ fontSize: "0.72rem", color: "var(--ink4)" }}>{data.total_registros} ventas</span>}
        </div>
        <div className="inv-table-wrap">
          {loading ? <div className="inv-loading"><span className="inv-spin" /> Cargando...</div> :
            !data || data.ventas.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">🧾</div><p>Sin ventas en el período</p></div> : (
              <table className="inv-table">
                <thead><tr><th>#</th><th>Fecha</th><th>Productos</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {data.ventas.map(v => (
                    <>
                      <tr key={v.id_venta} style={{ cursor: "pointer" }} onClick={() => setExpandido(expandido === v.id_venta ? null : v.id_venta)}>
                        <td className="inv-mono" style={{ color: "var(--ink4)", fontSize: "0.72rem" }}>#{v.id_venta}</td>
                        <td style={{ fontSize: "0.8rem" }}>{fmt(v.fecha)}</td>
                        <td style={{ color: "var(--ink3)", fontSize: "0.78rem" }}>{v.items.length} producto{v.items.length !== 1 ? "s" : ""}</td>
                        <td className="inv-mono" style={{ fontWeight: 700, color: "var(--green)" }}>${v.total.toFixed(2)}</td>
                        <td style={{ color: "var(--ink4)", fontSize: "0.72rem" }}>{expandido === v.id_venta ? "▲" : "▼"}</td>
                      </tr>
                      {expandido === v.id_venta && (
                        <tr key={`e-${v.id_venta}`}>
                          <td colSpan={5} style={{ padding: 0 }}>
                            <div style={{ background: "var(--bg3)", padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                                <thead><tr style={{ color: "var(--ink4)" }}><th style={{ textAlign: "left", padding: "3px 8px" }}>Producto</th><th style={{ textAlign: "right", padding: "3px 8px" }}>Cant.</th><th style={{ textAlign: "right", padding: "3px 8px" }}>P. Unit.</th><th style={{ textAlign: "right", padding: "3px 8px" }}>Subtotal</th></tr></thead>
                                <tbody>
                                  {v.items.map((it, j) => (
                                    <tr key={j}>
                                      <td style={{ padding: "4px 8px" }}>{it.nombre}</td>
                                      <td className="inv-mono" style={{ padding: "4px 8px", textAlign: "right" }}>{it.cantidad}</td>
                                      <td className="inv-mono" style={{ padding: "4px 8px", textAlign: "right", color: "var(--ink3)" }}>${it.precio_unitario.toFixed(2)}</td>
                                      <td className="inv-mono" style={{ padding: "4px 8px", textAlign: "right", color: "var(--green)", fontWeight: 600 }}>${it.subtotal.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </div>
  );
}

// ── PROVEEDORES ───────────────────────────────────────────────────────────────
function ProveedoresTab({ token }) {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [alert, setAlert] = useState({ msg: "", type: "ok" });
  const [form, setForm] = useState({ nombre: "", contacto: "", telefono: "", email: "", direccion: "", activo: true });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const cargar = async () => { setLoading(true); try { setProveedores(await apiFetch("/proveedores/", {}, token)); } catch (e) { setAlert({ msg: e.message, type: "err" }); } setLoading(false); };
  useEffect(() => { cargar(); }, []);

  const handleGuardar = async e => {
    e.preventDefault();
    try {
      if (editando) { await apiFetch(`/proveedores/${editando}`, { method: "PUT", body: JSON.stringify(form) }, token); setAlert({ msg: "Proveedor actualizado", type: "ok" }); }
      else { await apiFetch("/proveedores/", { method: "POST", body: JSON.stringify(form) }, token); setAlert({ msg: "Proveedor creado", type: "ok" }); }
      setShowForm(false); setEditando(null); setForm({ nombre: "", contacto: "", telefono: "", email: "", direccion: "", activo: true }); cargar();
    } catch (e) { setAlert({ msg: e.message, type: "err" }); }
  };
  const handleEditar = p => { setForm({ nombre: p.nombre, contacto: p.contacto || "", telefono: p.telefono || "", email: p.email || "", direccion: p.direccion || "", activo: p.activo }); setEditando(p.id_proveedor); setShowForm(true); };
  const handleEliminar = async id => { if (!confirm("¿Eliminar este proveedor?")) return; try { await apiFetch(`/proveedores/${id}`, { method: "DELETE" }, token); setAlert({ msg: "Proveedor eliminado", type: "ok" }); cargar(); } catch (e) { setAlert({ msg: e.message, type: "err" }); } };

  return (
    <div className="inv-fade">
      <div className="inv-ph"><h2>Proveedores</h2><p>Gestiona tu red de proveedores</p></div>
      <Alert msg={alert.msg} type={alert.type} />
      <div className="inv-stats" style={{ gridTemplateColumns: "repeat(2,1fr)", marginBottom: 18 }}>
        {[{ lbl: "Total proveedores", val: proveedores.length, color: "#1a1916" }, { lbl: "Activos", val: proveedores.filter(p => p.activo).length, color: "#1a6b4a" }].map(s => (
          <div key={s.lbl} className="inv-stat">
            <div className="inv-stat-accent" style={{ background: s.color }} />
            <div className="inv-stat-lbl">{s.lbl}</div>
            <div className="inv-stat-val">{s.val}</div>
          </div>
        ))}
      </div>
      <div className="inv-card">
        <div className="inv-card-head">
          <div className="inv-card-title"><Icons.Truck /> Proveedores</div>
          <button className="inv-btn inv-btn-primary inv-btn-sm" onClick={() => { setShowForm(!showForm); setEditando(null); setForm({ nombre: "", contacto: "", telefono: "", email: "", direccion: "", activo: true }); }}>
            <Icons.Plus /> Nuevo proveedor
          </button>
        </div>
        {showForm && (
          <>
            <div style={{ padding: "12px 18px 0" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink3)" }}>{editando ? "Editar proveedor" : "Nuevo proveedor"}</span>
            </div>
            <form onSubmit={handleGuardar}>
              <div className="inv-form-grid">
                <div className="inv-fg"><label className="inv-label">Nombre *</label><input className="inv-input" value={form.nombre} onChange={set("nombre")} required placeholder="Empresa o persona" /></div>
                <div className="inv-fg"><label className="inv-label">Contacto</label><input className="inv-input" value={form.contacto} onChange={set("contacto")} placeholder="Nombre del contacto" /></div>
                <div className="inv-fg"><label className="inv-label">Teléfono</label><input className="inv-input" value={form.telefono} onChange={set("telefono")} placeholder="+57 300 000 0000" /></div>
                <div className="inv-fg"><label className="inv-label">Email</label><input className="inv-input" type="email" value={form.email} onChange={set("email")} placeholder="proveedor@empresa.com" /></div>
                <div className="inv-fg inv-col2"><label className="inv-label">Dirección</label><input className="inv-input" value={form.direccion} onChange={set("direccion")} placeholder="Calle, ciudad" /></div>
                <div className="inv-col2" style={{ display: "flex", gap: 8 }}>
                  <button className="inv-btn inv-btn-green" type="submit"><Icons.Check /> {editando ? "Guardar cambios" : "Crear proveedor"}</button>
                  <button className="inv-btn inv-btn-ghost" type="button" onClick={() => { setShowForm(false); setEditando(null); }}>Cancelar</button>
                </div>
              </div>
            </form>
            <div className="inv-divider" />
          </>
        )}
        <div className="inv-table-wrap">
          {loading ? <div className="inv-loading"><span className="inv-spin" /> Cargando...</div> :
            proveedores.length === 0 ? <div className="inv-empty"><div className="inv-empty-ico">🚚</div><p>No hay proveedores registrados</p></div> : (
              <table className="inv-table">
                <thead><tr><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {proveedores.map(p => (
                    <tr key={p.id_proveedor}>
                      <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                      <td style={{ color: "var(--ink3)" }}>{p.contacto || "—"}</td>
                      <td className="inv-mono" style={{ fontSize: "0.78rem" }}>{p.telefono || "—"}</td>
                      <td style={{ fontSize: "0.78rem", color: "var(--blue2)" }}>{p.email || "—"}</td>
                      <td><span className={`inv-badge ${p.activo ? "inv-badge-green" : "inv-badge-gray"}`}>{p.activo ? "Activo" : "Inactivo"}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="inv-btn-ico inv-btn-ico-edit" onClick={() => handleEditar(p)}><Icons.Edit /></button>
                          <button className="inv-btn-ico" onClick={() => handleEliminar(p.id_proveedor)}><Icons.Trash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </div>
  );
}

// ── TELEGRAM ──────────────────────────────────────────────────────────────────
function TelegramTab({ token }) {
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [estado, setEstado] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (texto, tipo = "ok") => {
    const hora = new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs(prev => [{ texto, tipo, hora }, ...prev].slice(0, 20));
  };

  const call = async (endpoint, setLoading, label) => {
    setLoading(true);
    try {
      const res = await apiFetch(endpoint, { method: "POST" }, token);
      if (res.ok) { addLog(`${label} — enviado correctamente`, "ok"); setEstado("ok"); }
      else { addLog(`${label} — error al enviar`, "err"); setEstado("err"); }
    } catch (e) { addLog(`${label} — ${e.message}`, "err"); setEstado("err"); }
    setLoading(false);
  };

  const handleMensaje = async e => {
    e.preventDefault(); if (!mensaje.trim()) return; setLoadingMsg(true);
    try {
      const res = await apiFetch("/telegram/mensaje", { method: "POST", body: JSON.stringify({ texto: mensaje }) }, token);
      if (res.ok) { addLog(`Mensaje enviado: "${mensaje.slice(0, 40)}${mensaje.length > 40 ? "..." : ""}"`, "ok"); setMensaje(""); }
      else addLog("Error al enviar mensaje", "err");
    } catch (e) { addLog(e.message, "err"); }
    setLoadingMsg(false);
  };

  const actions = [
    { label: "Probar conexión", desc: "Envía un mensaje de prueba para verificar que el bot responde", icon: "🔌", fn: () => call("/telegram/test", setLoadingTest, "Test de conexión"), loading: loadingTest, style: "inv-btn-primary" },
    { label: "Alertas de stock", desc: "Revisa todos los productos y notifica los que están bajo el mínimo", icon: "⚠️", fn: () => call("/telegram/alertas-stock", setLoadingStock, "Alertas de stock"), loading: loadingStock, style: "inv-btn-amber" },
    { label: "Resumen del día", desc: "Envía un reporte completo de ventas e inventario de hoy", icon: "📊", fn: () => call("/telegram/resumen-hoy", setLoadingResumen, "Resumen del día"), loading: loadingResumen, style: "inv-btn-ghost" },
  ];

  const comandos = [
    { cmd: "/stock", desc: "Ver stock de todos los productos" },
    { cmd: "/ventas", desc: "Resumen de ventas del día" },
    { cmd: "/entrada 3 50 Reposición", desc: "Registrar entrada de stock" },
    { cmd: "/salida 3 10 Ajuste", desc: "Registrar salida de stock" },
    { cmd: "/buscar camisa", desc: "Buscar producto por nombre" },
    { cmd: "/ayuda", desc: "Ver todos los comandos" },
  ];

  return (
    <div className="inv-fade">
      <div className="inv-ph">
        <h2>Telegram Bot</h2>
        <p>Controla y monitorea tu inventario desde Telegram</p>
      </div>

      {/* Status banner */}
      <div className="inv-card" style={{ marginBottom: 18, borderLeft: `3px solid ${estado === "ok" ? "var(--green2)" : estado === "err" ? "var(--red2)" : "var(--border2)"}` }}>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: "1.5rem" }}>✈️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 2 }}>Bot de Telegram activo</div>
            <div style={{ fontSize: "0.76rem", color: "var(--ink3)" }}>Recibe alertas automáticas con cada venta y cada vez que el stock baje del mínimo</div>
          </div>
          {estado && (
            <span className={`inv-badge ${estado === "ok" ? "inv-badge-green" : "inv-badge-red"}`}>
              {estado === "ok" ? "✓ Conectado" : "✗ Error"}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Acciones rápidas */}
          {actions.map((a, i) => (
            <div key={i} className="inv-card">
              <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "1.3rem" }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.84rem", marginBottom: 2 }}>{a.label}</div>
                  <div style={{ fontSize: "0.74rem", color: "var(--ink3)" }}>{a.desc}</div>
                </div>
                <button className={`inv-btn ${a.style} inv-btn-sm`} onClick={a.fn} disabled={a.loading} style={{ flexShrink: 0 }}>
                  {a.loading ? <span className="inv-spin" /> : <Icons.Send />}
                  {a.loading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          ))}
          {/* Mensaje personalizado */}
          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title">📢 Mensaje personalizado</div></div>
            <form onSubmit={handleMensaje}>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                <textarea className="inv-input" style={{ resize: "vertical", minHeight: 80 }} placeholder="Escribe tu mensaje..." value={mensaje} onChange={e => setMensaje(e.target.value)} />
                <button className="inv-btn inv-btn-primary inv-btn-sm" type="submit" disabled={loadingMsg || !mensaje.trim()} style={{ alignSelf: "flex-start" }}>
                  {loadingMsg ? <span className="inv-spin" /> : <><Icons.Send /> Enviar a Telegram</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Log */}
          <div className="inv-card">
            <div className="inv-card-head">
              <div className="inv-card-title"><Icons.List /> Actividad reciente</div>
              {logs.length > 0 && <button className="inv-btn inv-btn-ghost inv-btn-sm" onClick={() => setLogs([])}>Limpiar</button>}
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7, minHeight: 160 }}>
              {logs.length === 0 ? (
                <div className="inv-empty" style={{ padding: "20px 0" }}>
                  <div className="inv-empty-ico">📭</div>
                  <p>Usa los botones para enviar mensajes</p>
                </div>
              ) : logs.map((l, i) => (
                <div key={i} className={`inv-log-item ${l.tipo === "ok" ? "inv-log-ok" : "inv-log-err"}`}>
                  <span>{l.texto}</span>
                  <span style={{ fontSize: "0.66rem", opacity: 0.7, flexShrink: 0 }}>{l.hora}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Comandos */}
          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title">📟 Comandos disponibles</div></div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {comandos.map((c, i) => (
                <div key={i}>
                  <code style={{ fontSize: "0.72rem", background: "var(--green3)", color: "var(--green)", padding: "2px 7px", borderRadius: 4, fontFamily: "var(--mono)" }}>{c.cmd}</code>
                  <div style={{ fontSize: "0.72rem", color: "var(--ink3)", marginTop: 2 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Automático */}
          <div className="inv-card">
            <div className="inv-card-head"><div className="inv-card-title">🤖 Notificaciones automáticas</div></div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { ico: "🛒", txt: "Cada venta registrada → notificación instantánea" },
                { ico: "⚠️", txt: "Stock bajo tras una venta → alerta automática" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 10px", background: "var(--bg3)", borderRadius: 7, border: "1px solid var(--border)" }}>
                  <span>{item.ico}</span>
                  <span style={{ fontSize: "0.76rem", color: "var(--ink2)" }}>{item.txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  injectStyles();
  const [token, setToken] = useState(() => localStorage.getItem("inv_token") || "");
  const [userData, setUserData] = useState(() => { try { return JSON.parse(localStorage.getItem("inv_user") || "null"); } catch { return null; } });
  const [tab, setTab] = useState("productos");

  const handleLogin = t => {
    setToken(t); localStorage.setItem("inv_token", t);
    try { const p = JSON.parse(atob(t.split(".")[1])); setUserData(p); localStorage.setItem("inv_user", JSON.stringify(p)); } catch {}
  };
  const handleLogout = () => { setToken(""); setUserData(null); localStorage.removeItem("inv_token"); localStorage.removeItem("inv_user"); };

  if (!token) return <LoginPage onLogin={handleLogin} />;

  const isAdmin = userData?.id_rol === 1;
  const userId = userData?.id_usuario;

  const tabs = [
    { id: "dashboard",   label: "Dashboard",      icon: <Icons.Chart />,  adminOnly: true },
    { id: "productos",   label: "Productos",       icon: <Icons.Box /> },
    { id: "ventas",      label: "Nueva Venta",     icon: <Icons.Cart /> },
    { id: "movimientos", label: "Movimientos",     icon: <Icons.List /> },
    { id: "ia",          label: "Asistente IA",    icon: <Icons.Brain /> },
    { id: "prediccion",  label: "Predicción IA",   icon: <Icons.Star />,  adminOnly: true },
    { id: "reporte",     label: "Reporte PDF",     icon: <Icons.Pdf />,   adminOnly: true },
    { id: "historial",   label: "Historial",       icon: <Icons.Clock />, adminOnly: true },
    { id: "proveedores", label: "Proveedores",     icon: <Icons.Truck />, adminOnly: true },
    { id: "telegram",    label: "Telegram Bot",    icon: <Icons.Send />,  adminOnly: true },
    { id: "usuarios",    label: "Usuarios",         icon: <Icons.Robot />, adminOnly: true },
  ].filter(t => !t.adminOnly || isAdmin);

  return (
    <div className="inv-app">
      <header className="inv-top">
        <div className="inv-logo">
          <div className="inv-logo-mark"><Icons.Box size={16} /></div>
          <span className="inv-logo-name">Inventario <em>Pro</em></span>
        </div>
        <div className="inv-top-right">
          <div className="inv-user-pill">
            <span className="inv-user-dot" />
            <span>{userData?.sub}</span>
          </div>
          <span className="inv-role-pill">{isAdmin ? "Admin" : "Vendedor"}</span>
          <button className="inv-logout" onClick={handleLogout} title="Cerrar sesión"><Icons.Logout /></button>
        </div>
      </header>

      <nav className="inv-nav">
        {tabs.map(t => (
          <button key={t.id} className={`inv-nav-btn ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <main className="inv-main">
        {tab === "dashboard"   && <DashboardTab token={token} />}
        {tab === "productos"   && <ProductosTab token={token} isAdmin={isAdmin} />}
        {tab === "ventas"      && <VentasTab token={token} userId={userId} />}
        {tab === "movimientos" && <MovimientosTab token={token} isAdmin={isAdmin} />}
        {tab === "ia"          && <AsistenteIATab token={token} />}
        {tab === "prediccion"  && <PrediccionTab token={token} />}
        {tab === "reporte"     && <ReportePDFTab token={token} />}
        {tab === "historial"   && <HistorialVentasTab token={token} />}
        {tab === "proveedores" && <ProveedoresTab token={token} />}
        {tab === "telegram"    && <TelegramTab token={token} />}
        {tab === "usuarios"    && <UsuariosTab token={token} />}
      </main>
    </div>
  );
}