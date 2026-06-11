import { useEditorStore } from "./editor-store";

export class PluginManager {
  private static iframes: Record<string, HTMLIFrameElement> = {};

  static initListener() {
    if (typeof window === "undefined") return;
    
    // Ensure we only add the listener once
    if ((window as any).__pluginListenerAdded) return;
    (window as any).__pluginListenerAdded = true;

    window.addEventListener("message", (event) => {
      const data = event.data;
      if (!data || !data.pluginId || !data.action) return;

      // Security Check: Verify event.source matches the known iframe for this pluginId
      const iframe = PluginManager.iframes[data.pluginId];
      if (!iframe || event.source !== iframe.contentWindow) {
        console.warn(`[PluginManager] Rejected message from unverified source for plugin ${data.pluginId}`);
        return;
      }

      const store = useEditorStore.getState();

      switch (data.action) {
        case "REGISTER_COMPONENT": {
          const { type, defaultProps, template, icon, category, label } = data.payload;
          
          store.registerPluginComponent({
            type,
            label: label || type,
            icon: icon || "Box",
            category: category || "Plugins",
            defaultProps: defaultProps || {},
            isPlugin: true,
            pluginId: data.pluginId,
            template,
          });
          console.log(`Plugin [${data.pluginId}] registered component: ${type}`);
          break;
        }
        case "LOG": {
          console.log(`[Plugin: ${data.pluginId}]`, ...data.payload);
          break;
        }
        case "ERROR": {
          console.error(`[Plugin: ${data.pluginId}] Error:`, ...data.payload);
          break;
        }
      }
    });
  }

  static loadPlugin(pluginId: string, code: string) {
    // 1. Clean up existing plugin if it's being reloaded
    this.unloadPlugin(pluginId);

    // 2. Prepare the sandbox HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            // Sandboxed API Surface
            window.HytaleStudio = {
              plugins: {
                registerComponent: (type, config) => {
                  window.parent.postMessage({
                    pluginId: "${pluginId}",
                    action: "REGISTER_COMPONENT",
                    payload: { type, ...config }
                  }, "*");
                }
              }
            };

            // Catch errors and send to main window
            window.onerror = function(msg, url, lineNo, columnNo, error) {
              window.parent.postMessage({
                pluginId: "${pluginId}",
                action: "ERROR",
                payload: [msg, lineNo, columnNo]
              }, "*");
              return false;
            };
            
            // Proxy console.log
            const originalLog = console.log;
            console.log = function(...args) {
              window.parent.postMessage({
                pluginId: "${pluginId}",
                action: "LOG",
                payload: args
              }, "*");
              originalLog.apply(console, args);
            };
          </script>
          <script type="module">
            try {
              ${code}
            } catch (e) {
              console.error(e);
            }
          </script>
        </head>
        <body></body>
      </html>
    `;

    // 3. Create Iframe
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    // Important: allow-scripts is needed to run the plugin, 
    // but without allow-same-origin, the iframe is sandboxed into a unique origin
    iframe.sandbox.add("allow-scripts");
    
    // Convert HTML to a Blob URL
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    document.body.appendChild(iframe);
    this.iframes[pluginId] = iframe;
  }

  static unloadPlugin(pluginId: string) {
    if (this.iframes[pluginId]) {
      // Remove iframe from DOM
      document.body.removeChild(this.iframes[pluginId]);
      delete this.iframes[pluginId];
      
      // Remove components registered by this plugin
      useEditorStore.getState().clearPluginComponents(pluginId);
    }
  }
}
