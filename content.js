(() => {
    const api = globalThis.browser ?? globalThis.chrome; // Firefox: browser, Chrome: chrome
    let active = false;
    let hovered = null;
    let current = null;
  
    // ---------- UI (isolated in Shadow DOM) ----------
    const host = document.createElement("div");
    host.style.all = "initial";
    const shadow = host.attachShadow({ mode: "closed" });
    shadow.innerHTML = `
      <style>
        .hl { position: fixed; pointer-events: none; z-index: 2147483646;
              border: 2px solid #1e90ff; background: rgba(30,144,255,.15); display: none; }
        .panel { position: fixed; z-index: 2147483647; width: 420px; max-height: 320px;
                 overflow: auto; background: #1e1e1e; color: #ddd; font: 12px monospace;
                 border-radius: 8px; padding: 10px; box-shadow: 0 4px 20px rgba(0,0,0,.4);
                 display: none; }
        .panel pre { white-space: pre-wrap; margin: 6px 0; }
        .panel button { margin-right: 6px; cursor: pointer; }
        .panel h4 { margin: 8px 0 2px; color: #7ab7ff; }
      </style>
      <div class="hl"></div>
      <div class="panel">
        <button id="copy">Copy</button>
        <button id="save">Save</button>
        <button id="close">Close</button>
        <h4>HTML</h4><pre id="html"></pre>
        <h4>CSS</h4><pre id="css"></pre>
      </div>
    `;
    const hl = shadow.querySelector(".hl");
    const panel = shadow.querySelector(".panel");
    document.documentElement.appendChild(host);
  
    // ---------- Toggle (Alt+Shift+G, Esc to exit) ----------
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.shiftKey && e.code === "KeyG") {
        active = !active;
        if (!active) {
          hl.style.display = "none";
          panel.style.display = "none";
        }
      }
      if (e.key === "Escape" && active) {
        active = false;
        hl.style.display = "none";
        panel.style.display = "none";
      }
    }, true);
  
    // ---------- Hover highlight ----------
    document.addEventListener("mouseover", (e) => {
      if (!active || e.target === host) return;
      hovered = e.target;
      const r = hovered.getBoundingClientRect();
      Object.assign(hl.style, {
        display: "block",
        top: r.top + "px",
        left: r.left + "px",
        width: r.width + "px",
        height: r.height + "px",
      });
    }, true);
  
    // ---------- Extraction ----------
    function getHTML(el) {
      return el.outerHTML;
    }
  
    // Keep only computed properties that differ from a blank element of the same tag
    function getCSS(el) {
      const blank = document.createElement(el.tagName);
      document.body.appendChild(blank);
      const base = getComputedStyle(blank);
      const actual = getComputedStyle(el);
      const lines = [];
      for (const prop of actual) {
        const v = actual.getPropertyValue(prop);
        if (v !== base.getPropertyValue(prop)) lines.push(`  ${prop}: ${v};`);
      }
      blank.remove();
      return `.selected {\n${lines.join("\n")}\n}`;
    }
  
    // ---------- Panel ----------
    function showPanel(el) {
      current = {
        html: getHTML(el),
        css: getCSS(el),
        url: location.href,
        savedAt: Date.now(),
      };
      shadow.querySelector("#html").textContent = current.html; // textContent, never innerHTML
      shadow.querySelector("#css").textContent = current.css;
      shadow.querySelector("#save").textContent = "Save";
  
      const r = el.getBoundingClientRect();
      panel.style.display = "block";
      panel.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 440)) + "px";
      panel.style.top = Math.max(8, Math.min(r.bottom + 8, window.innerHeight - 340)) + "px";
    }
  
    shadow.querySelector("#copy").onclick = () =>
      navigator.clipboard.writeText(`${current.html}\n\n<style>\n${current.css}\n</style>`);
  
    shadow.querySelector("#save").onclick = async () => {
      await api.storage.local.set({ [`snippet_${current.savedAt}`]: current });
      shadow.querySelector("#save").textContent = "Saved ✓";
    };
  
    shadow.querySelector("#close").onclick = () => {
      panel.style.display = "none";
    };
  
    // ---------- Click to select ----------
    document.addEventListener("click", (e) => {
      if (!active || e.target === host) return;
      e.preventDefault();
      e.stopPropagation();
      showPanel(e.target);
    }, true); // capture phase: runs before the site's own handlers
  })();