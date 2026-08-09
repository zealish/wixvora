"use client";

import { EditorProvider } from "./editor-provider";
import { useEditor } from "./editor-provider";
import { EditorTopbar } from "./toolbar/editor-topbar";
import { LeftSidebar } from "./sidebar/left-sidebar";
import { EditorCanvas } from "./canvas/editor-canvas";
import { RightInspector } from "./inspector/right-inspector";
import { ExportModal } from "./modals/export-modal";
import { Toast } from "./ui/toast";

function EditorLayout() {
  const { toast, setToast } = useEditor();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <EditorTopbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <EditorCanvas />
        <RightInspector />
      </div>
      <ExportModal />
      {toast && (
        <Toast show={!!toast} message={toast || ""} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

export default function WebsiteEditor() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
}
