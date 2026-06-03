import { toPng } from "html-to-image";
import { toast } from "sonner";
import { useEditorStore } from "./editor-store";

export const handleExportImage = async () => {
  const node = document.getElementById("exportable-canvas");
  if (!node) {
    toast.error("Canvas not found!");
    return;
  }
  
  const toastId = toast.loading("Capturing layout image...");
  
  try {
    const dataUrl = await toPng(node, {
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
      pixelRatio: 1,
    });
    
    const store = useEditorStore.getState();
    const currentProject = store.projects.find((p) => p.id === store.currentProjectId);
    const activeFile = currentProject?.files.find(f => f.id === store.currentFileId);
    
    const rawName = activeFile?.name || currentProject?.name || "hytale-layout";
    const fileName = rawName.replace(/\.ui$/i, "");
    
    const link = document.createElement("a");
    link.download = `${fileName}-exported.png`;
    link.href = dataUrl;
    link.click();
    
    toast.success("Image exported successfully!", { id: toastId });
  } catch (err) {
    console.error("Failed to export image", err);
    toast.error("Failed to export image. Check console for details.", { id: toastId });
  }
};
