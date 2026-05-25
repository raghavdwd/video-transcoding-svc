import { useState, useRef, type FormEvent } from "react";
import UploadView from "./components/UploadView";
import StatusView from "./components/StatusView";
import "./index.css";

type View = "upload" | "status";
type Status = "idle" | "uploading" | "success" | "error";

type FileStatus = Record<string, unknown> & {
  filename?: string;
  status?: string;
  resolutions?: string[];
  transcodedFiles?: Record<string, string>;
};

export function App() {
  const [view, setView] = useState<View>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [selectedRes, setSelectedRes] = useState<string[]>(["720p"]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [searchId, setSearchId] = useState("");
  const [fileStatus, setFileStatus] = useState<FileStatus | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function toggleRes(res: string) {
    setSelectedRes((prev) =>
      prev.includes(res) ? prev.filter((r) => r !== res) : [...prev, res],
    );
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file || selectedRes.length === 0) return;
    setStatus("uploading");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("resolutions", JSON.stringify(selectedRes));
    try {
      const res = await fetch("/api/v1/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        const fn = (data.file as Record<string, unknown>)?.filename as string;
        setSearchId(fn);
        setMessage(data.message || "Uploaded");
      } else {
        setStatus("error");
        setMessage(data.error || "Upload failed");
      }
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!searchId.trim()) return;
    try {
      const res = await fetch(`/api/v1/file-status?id=${searchId}`);
      const data = await res.json();
      setFileStatus(
        (data as Record<string, unknown>).files as FileStatus,
      );
    } catch {
      setFileStatus(null);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <header className="border-b border-gray-100">
        <div className="max-w-xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 tracking-tight">
            transcoder
          </span>
          <nav className="flex items-center gap-1">
            {(["upload", "status"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  view === v
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {v}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-24 pb-32">
        {view === "upload" ? (
          <UploadView
            file={file}
            selectedRes={selectedRes}
            status={status}
            message={message}
            inputRef={inputRef}
            onUpload={handleUpload}
            onToggleRes={toggleRes}
            onFileChange={setFile}
            onStatusChange={setStatus}
            onViewChange={setView}
          />
        ) : (
          <StatusView
            searchId={searchId}
            fileStatus={fileStatus}
            onSearchIdChange={setSearchId}
            onSearch={handleSearch}
          />
        )}
      </main>
    </div>
  );
}

export default App;
