export const injectStyles = () => {
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
    .inv-top { height: 58px; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 200; background: rgba(247,246,243,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
    .inv-logo { display: flex; align-items: center; gap: 10px; }
    .inv-logo-mark { width: 32px; height: 32px; background: var(--ink); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .inv-logo-mark svg { color: #f7f6f3; }
    .inv-logo-name { font-family: var(--serif); font-size: 1.1rem; font-weight: 600; color: var(--ink); letter-spacing: -0.01em; }
    .inv-logo-name em { font-style: italic; color: var(--green); }
    .inv-top-right { display: flex; align-items: center; gap: 8px; }
    .inv-user-pill { display: flex; align-items: center; gap: 7px; padding: 5px 12px; background: var(--bg2); border: 1px solid var(--border2); border-radius: 20px; font-size: 0.76rem; color: var(--ink2); box-shadow: var(--shadow2); }
    .inv-user-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green2); box-shadow: 0 0 0 2px var(--green3); }
    .inv-role-pill { padding: 4px 10px; background: var(--ink); color: #f7f6f3; border-radius: 20px; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
    .inv-logout { width: 34px; height: 34px; border-radius: var(--r2); border: 1px solid var(--border2); background: var(--bg2); color: var(--ink3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: var(--shadow2); }
    .inv-logout:hover { background: var(--red3); border-color: rgba(196,58,37,0.3); color: var(--red2); }
    .inv-nav { display: flex; padding: 0 28px; background: var(--bg2); border-bottom: 1px solid var(--border); box-shadow: 0 1px 0 rgba(0,0,0,0.03); overflow-x: auto; }
    .inv-nav::-webkit-scrollbar { display: none; }
    .inv-nav-btn { position: relative; display: flex; align-items: center; gap: 6px; padding: 13px 16px; font-family: var(--sans); font-size: 0.78rem; font-weight: 500; color: var(--ink3); background: none; border: none; cursor: pointer; white-space: nowrap; transition: color 0.18s; }
    .inv-nav-btn::after { content: ''; position: absolute; bottom: 0; left: 16px; right: 16px; height: 2px; background: var(--ink); border-radius: 2px 2px 0 0; transform: scaleX(0); transition: transform 0.25s var(--ease); }
    .inv-nav-btn:hover { color: var(--ink2); }
    .inv-nav-btn.on { color: var(--ink); font-weight: 600; }
    .inv-nav-btn.on::after { transform: scaleX(1); }
    .inv-main { flex: 1; padding: 28px; max-width: 1360px; margin: 0 auto; width: 100%; }
    .inv-app { min-height: 100vh; display: flex; flex-direction: column; }
    .inv-ph { margin-bottom: 24px; }
    .inv-ph h2 { font-family: var(--serif); font-size: 1.7rem; font-weight: 600; color: var(--ink); letter-spacing: -0.02em; line-height: 1.2; }
    .inv-ph p { font-size: 0.8rem; color: var(--ink4); margin-top: 3px; }
    .inv-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px,1fr)); gap: 14px; margin-bottom: 24px; }
    .inv-stat { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r); padding: 18px 20px; box-shadow: var(--shadow2); transition: all 0.25s var(--ease); position: relative; overflow: hidden; }
    .inv-stat:hover { transform: translateY(-2px); box-shadow: var(--shadow); border-color: var(--border2); }
    .inv-stat-accent { position: absolute; top: 0; left: 0; width: 100%; height: 3px; }
    .inv-stat-lbl { font-size: 0.67rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink4); margin-bottom: 8px; }
    .inv-stat-val { font-family: var(--serif); font-size: 2.2rem; font-weight: 600; line-height: 1; letter-spacing: -0.03em; color: var(--ink); margin-bottom: 4px; }
    .inv-stat-sub { font-size: 0.7rem; color: var(--ink4); }
    .inv-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; box-shadow: var(--shadow2); }
    .inv-card-head { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg2); }
    .inv-card-title { font-size: 0.76rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink2); display: flex; align-items: center; gap: 7px; }
    .inv-table-wrap { overflow-x: auto; }
    .inv-table { width: 100%; border-collapse: collapse; }
    .inv-table th { padding: 9px 14px; text-align: left; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink4); background: var(--bg3); border-bottom: 1px solid var(--border); }
    .inv-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 0.82rem; color: var(--ink2); transition: background 0.12s; }
    .inv-table tr:last-child td { border-bottom: none; }
    .inv-table tbody tr:hover td { background: var(--bg3); }
    .inv-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 4px; font-size: 0.63rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }
    .inv-badge-green { background: var(--green3); color: var(--green); border: 1px solid rgba(45,158,114,0.2); }
    .inv-badge-red   { background: var(--red3);   color: var(--red);   border: 1px solid rgba(196,58,37,0.2); }
    .inv-badge-amber { background: var(--amber3); color: var(--amber); border: 1px solid rgba(201,123,26,0.2); }
    .inv-badge-blue  { background: var(--blue3);  color: var(--blue);  border: 1px solid rgba(45,111,173,0.2); }
    .inv-badge-gray  { background: var(--bg3);    color: var(--ink3);  border: 1px solid var(--border2); }
    .inv-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 18px; }
    .inv-col2 { grid-column: span 2; }
    .inv-fg { display: flex; flex-direction: column; gap: 5px; }
    .inv-label { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink3); }
    .inv-input, .inv-select, .inv-textarea { background: var(--bg); border: 1.5px solid var(--border2); color: var(--ink); padding: 9px 12px; border-radius: var(--r2); font-family: var(--sans); font-size: 0.83rem; outline: none; width: 100%; transition: all 0.18s; }
    .inv-input:focus, .inv-select:focus, .inv-textarea:focus { border-color: var(--green2); background: var(--bg2); box-shadow: 0 0 0 3px var(--green3); }
    .inv-input::placeholder, .inv-textarea::placeholder { color: var(--ink4); }
    .inv-select option { background: var(--bg2); }
    .inv-textarea { resize: vertical; min-height: 72px; }
    .inv-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: var(--r2); font-family: var(--sans); font-size: 0.8rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.18s var(--ease); letter-spacing: 0.01em; white-space: nowrap; }
    .inv-btn-primary { background: var(--ink); color: var(--bg); box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
    .inv-btn-primary:hover { background: var(--ink2); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .inv-btn-green { background: var(--green); color: #fff; box-shadow: 0 1px 3px rgba(26,107,74,0.3); }
    .inv-btn-green:hover { background: var(--green2); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,107,74,0.3); }
    .inv-btn-ghost { background: var(--bg2); color: var(--ink2); border: 1.5px solid var(--border2); }
    .inv-btn-ghost:hover { background: var(--bg3); border-color: var(--border2); }
    .inv-btn-danger { background: var(--red3); color: var(--red); border: 1.5px solid rgba(196,58,37,0.2); }
    .inv-btn-danger:hover { background: rgba(196,58,37,0.12); }
    .inv-btn-amber { background: var(--amber3); color: var(--amber); border: 1.5px solid rgba(201,123,26,0.2); }
    .inv-btn-amber:hover { background: rgba(201,123,26,0.12); }
    .inv-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
    .inv-btn-sm { padding: 6px 12px; font-size: 0.73rem; }
    .inv-btn-ico { width: 30px; height: 30px; padding: 0; border-radius: var(--r2); background: var(--bg3); border: 1px solid var(--border); color: var(--ink3); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.18s; }
    .inv-btn-ico:hover { background: var(--red3); border-color: rgba(196,58,37,0.3); color: var(--red2); }
    .inv-btn-ico-edit:hover { background: var(--blue3); border-color: rgba(45,111,173,0.3); color: var(--blue2); }
    .inv-alert { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: var(--r2); font-size: 0.8rem; margin-bottom: 14px; animation: slideDown 0.22s var(--ease) both; }
    .inv-alert-ok  { background: var(--green3); border: 1px solid rgba(45,158,114,0.25); color: var(--green); }
    .inv-alert-err { background: var(--red3);   border: 1px solid rgba(196,58,37,0.25);  color: var(--red); }
    .inv-login { min-height: 100vh; display: grid; grid-template-columns: 1fr 480px; }
    .inv-login-left { background: var(--ink); display: flex; align-items: center; justify-content: center; padding: 48px; position: relative; overflow: hidden; }
    .inv-login-left::before { content: ''; position: absolute; width: 600px; height: 600px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.04); top: 50%; left: 50%; transform: translate(-50%, -50%); }
    .inv-login-left::after { content: ''; position: absolute; width: 320px; height: 320px; border-radius: 50%; background: radial-gradient(circle, rgba(45,158,114,0.12) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); }
    .inv-login-hero { position: relative; z-index: 1; text-align: center; }
    .inv-login-hero h1 { font-family: var(--serif); font-size: 3rem; font-weight: 600; color: #f7f6f3; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 16px; }
    .inv-login-hero h1 em { font-style: italic; color: var(--green2); }
    .inv-login-hero p { font-size: 0.85rem; color: rgba(247,246,243,0.45); max-width: 280px; margin: 0 auto; line-height: 1.7; }
    .inv-login-feats { margin-top: 40px; display: flex; flex-direction: column; gap: 12px; text-align: left; }
    .inv-login-feat { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; }
    .inv-login-feat-ico { width: 32px; height: 32px; border-radius: 7px; display: flex; align-items: center; justify-content: center; background: rgba(45,158,114,0.15); color: var(--green2); flex-shrink: 0; }
    .inv-login-feat span { font-size: 0.78rem; color: rgba(247,246,243,0.6); }
    .inv-login-right { background: var(--bg); display: flex; align-items: center; justify-content: center; padding: 48px 40px; }
    .inv-login-form-wrap { width: 100%; max-width: 360px; animation: riseUp 0.4s var(--ease) both; }
    .inv-login-form-wrap h2 { font-family: var(--serif); font-size: 1.6rem; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
    .inv-login-form-wrap p { font-size: 0.8rem; color: var(--ink4); margin-bottom: 28px; }
    .inv-login-form { display: flex; flex-direction: column; gap: 14px; }
    .inv-items { padding: 12px 14px; display: flex; flex-direction: column; gap: 7px; }
    .inv-item { display: flex; align-items: center; gap: 10px; background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; transition: all 0.15s; animation: fadeIn 0.2s var(--ease); }
    .inv-item:hover { border-color: var(--border2); background: var(--bg2); }
    .inv-item-name { flex: 1; font-size: 0.82rem; font-weight: 500; }
    .inv-item-price { font-size: 0.74rem; color: var(--green); font-family: var(--mono); }
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
    .inv-spin { width: 15px; height: 15px; border: 2px solid rgba(0,0,0,0.1); border-top-color: var(--green); border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
    .inv-empty { text-align: center; padding: 48px 24px; color: var(--ink4); }
    .inv-empty-ico { font-size: 2rem; margin-bottom: 8px; opacity: 0.35; }
    .inv-empty p { font-size: 0.8rem; }
    .inv-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 40px; color: var(--ink4); font-size: 0.8rem; }
    .inv-chat-wrap { display: flex; flex-direction: column; height: calc(100vh - 190px); max-height: 680px; }
    .inv-chat-msgs { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 14px; }
    .inv-chat-msg { display: flex; gap: 10px; animation: fadeIn 0.2s var(--ease); }
    .inv-chat-msg.user { flex-direction: row-reverse; }
    .inv-chat-av { width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; }
    .inv-chat-av.ai { background: var(--ink); color: var(--bg); }
    .inv-chat-av.user { background: var(--green3); border: 1px solid rgba(45,158,114,0.2); color: var(--green); }
    .inv-chat-bubble { max-width: 74%; padding: 10px 14px; border-radius: 10px; font-size: 0.82rem; line-height: 1.65; }
    .inv-chat-bubble.ai { background: var(--bg3); border: 1px solid var(--border); color: var(--ink2); border-top-left-radius: 3px; }
    .inv-chat-bubble.user { background: var(--ink); color: var(--bg); border-top-right-radius: 3px; }
    .inv-chat-input-area { padding: 14px 18px; border-top: 1px solid var(--border); display: flex; gap: 10px; background: var(--bg3); }
    .inv-chat-input { flex: 1; background: var(--bg2); border: 1.5px solid var(--border2); color: var(--ink); padding: 9px 13px; border-radius: 8px; font-family: var(--sans); font-size: 0.82rem; outline: none; resize: none; min-height: 40px; max-height: 110px; transition: border-color 0.18s; }
    .inv-chat-input:focus { border-color: var(--green2); box-shadow: 0 0 0 3px var(--green3); }
    .inv-chat-input::placeholder { color: var(--ink4); }
    .inv-chat-send { width: 40px; height: 40px; border-radius: 8px; border: none; cursor: pointer; background: var(--ink); color: var(--bg); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.18s; }
    .inv-chat-send:hover:not(:disabled) { background: var(--ink2); transform: translateY(-1px); }
    .inv-chat-send:disabled { opacity: 0.35; cursor: not-allowed; }
    .inv-typing { display: flex; gap: 4px; padding: 5px 0; }
    .inv-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--ink3); opacity: 0.4; animation: blink 1.2s infinite; }
    .inv-typing span:nth-child(2) { animation-delay: 0.2s; }
    .inv-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes blink { 0%,60%,100%{opacity:0.2;transform:scale(1)} 30%{opacity:1;transform:scale(1.3)} }
    .inv-sugg-bar { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 18px 12px; }
    .inv-sugg { padding: 5px 11px; border-radius: 20px; font-size: 0.71rem; cursor: pointer; background: var(--bg2); border: 1px solid var(--border2); color: var(--ink2); transition: all 0.15s; }
    .inv-sugg:hover { background: var(--green3); border-color: rgba(45,158,114,0.3); color: var(--green); }
    .inv-modal-bg { position: fixed; inset: 0; background: rgba(26,25,22,0.55); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.18s ease; }
    .inv-modal { width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 24px 64px rgba(0,0,0,0.16); animation: riseUp 0.22s var(--ease) both; }
    .inv-confirm-modal { width: 100%; max-width: 380px; background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 24px 64px rgba(0,0,0,0.16); animation: riseUp 0.22s var(--ease) both; padding: 24px; }
    .inv-confirm-modal h3 { font-family: var(--serif); font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; color: var(--ink); }
    .inv-confirm-modal p { font-size: 0.82rem; color: var(--ink3); margin-bottom: 20px; line-height: 1.6; }
    .inv-confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .inv-log-item { padding: 10px 12px; border-radius: var(--r2); font-size: 0.78rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .inv-log-ok  { background: var(--green3); border: 1px solid rgba(45,158,114,0.15); color: var(--green); }
    .inv-log-err { background: var(--red3);   border: 1px solid rgba(196,58,37,0.15);  color: var(--red); }
    .inv-bar-chart { display: flex; align-items: flex-end; gap: 5px; height: 130px; }
    .inv-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
    .inv-bar { width: 100%; border-radius: 4px 4px 0 0; background: var(--ink); transition: height 0.4s var(--ease); }
    .inv-bar:hover { background: var(--green2); }
    .inv-bar-lbl { font-size: 0.55rem; color: var(--ink4); transform: rotate(-40deg); white-space: nowrap; }
    .inv-bar-val { font-size: 0.58rem; color: var(--ink3); font-family: var(--mono); }
    .inv-progress { height: 5px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
    .inv-progress-fill { height: 100%; border-radius: 3px; background: var(--ink); transition: width 0.5s var(--ease); }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--ink4); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes riseUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .inv-fade { animation: riseUp 0.3s var(--ease) both; }
    .inv-fade-1 { animation-delay: 0.05s; }
    .inv-fade-2 { animation-delay: 0.1s; }
    .inv-fade-3 { animation-delay: 0.15s; }
  `;
  document.head.appendChild(s);
};
