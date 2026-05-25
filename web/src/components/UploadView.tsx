import { type FormEvent, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileVideo, Check, Loader2, Search } from "lucide-react";

const RESOLUTIONS = ["480p", "720p", "1080p"] as const;
type Status = "idle" | "uploading" | "success" | "error";

type UploadViewProps = {
  file: File | null;
  selectedRes: string[];
  status: Status;
  message: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onUpload: (e: FormEvent) => Promise<void>;
  onToggleRes: (res: string) => void;
  onFileChange: (file: File | null) => void;
  onStatusChange: (status: Status) => void;
  onViewChange: (view: "upload" | "status") => void;
};

export default function UploadView({
  file,
  selectedRes,
  status,
  message,
  inputRef,
  onUpload,
  onToggleRes,
  onFileChange,
  onStatusChange,
  onViewChange,
}: UploadViewProps) {
  return (
    <>
      <h1 className="text-2xl font-light text-gray-900 tracking-tight">
        Upload a video
      </h1>
      <p className="mt-1.5 text-sm text-gray-400">
        Choose a file and select output resolutions.
      </p>

      <form onSubmit={onUpload} className="mt-10">
        <div
          onClick={() => inputRef.current?.click()}
          className="border border-dashed border-gray-200 rounded-xl py-14 px-8 flex flex-col items-center gap-3 cursor-pointer hover:border-gray-300 transition-colors"
        >
          <div className="size-10 rounded-full bg-gray-50 flex items-center justify-center">
            {file ? (
              <FileVideo className="size-4 text-gray-400" />
            ) : (
              <Upload className="size-4 text-gray-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-900">
              {file ? file.name : "Choose a video file"}
            </p>
            {file && (
              <p className="text-xs text-gray-400 mt-0.5">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {file ? "Tap to change" : "MP4, WebM, MOV"}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              onFileChange(e.target.files?.[0] ?? null);
              onStatusChange("idle");
            }}
          />
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-3">Output resolutions</p>
          <div className="flex gap-2">
            {RESOLUTIONS.map((res) => {
              const active = selectedRes.includes(res);
              return (
                <button
                  key={res}
                  type="button"
                  onClick={() => onToggleRes(res)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                    active
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {res}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          disabled={!file || selectedRes.length === 0 || status === "uploading"}
          className="mt-8 w-full h-11 text-sm"
        >
          {status === "uploading" ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Transcoding...
            </>
          ) : (
            <>
              <Upload className="size-4 mr-2" />
              Upload & Transcode
            </>
          )}
        </Button>

        {status === "success" && (
          <>
            <p className="mt-3 text-sm text-green-600 flex items-center gap-1.5">
              <Check className="size-4" /> {message}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => onViewChange("status")}
              className="mt-3 w-full h-11 text-sm"
            >
              <Search className="size-4 mr-2" />
              Check Status
            </Button>
          </>
        )}
        {status === "error" && (
          <p className="mt-3 text-sm text-red-500">{message}</p>
        )}
      </form>
    </>
  );
}
