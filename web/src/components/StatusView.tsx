import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Film, Download, Search } from "lucide-react";

type FileStatus = Record<string, unknown> & {
  filename?: string;
  status?: string;
  resolutions?: string[];
  transcodedFiles?: Record<string, string>;
};

type StatusViewProps = {
  searchId: string;
  fileStatus: FileStatus | null;
  onSearchIdChange: (id: string) => void;
  onSearch: (e: FormEvent) => Promise<void>;
};

export default function StatusView({
  searchId,
  fileStatus,
  onSearchIdChange,
  onSearch,
}: StatusViewProps) {
  return (
    <>
      <h1 className="text-2xl font-light text-gray-900 tracking-tight">
        Check status
      </h1>
      <p className="mt-1.5 text-sm text-gray-400">
        Look up a file&apos;s transcoding status by filename.
      </p>

      <form onSubmit={onSearch} className="mt-10 flex gap-2">
        <input
          type="text"
          value={searchId}
          onChange={(e) => onSearchIdChange(e.target.value)}
          placeholder="filename"
          className="flex-1 h-11 px-4 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-200 transition-shadow"
        />
        <Button type="submit" className="h-11 px-5 text-sm shrink-0">
          <Search className="size-4 mr-1.5" />
          Check
        </Button>
      </form>

      {fileStatus && (
        <div className="mt-8 border border-gray-100 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Film className="size-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {fileStatus.filename || ""}
            </span>
          </div>
          <div className="h-px bg-gray-50" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-gray-400">Status</span>
            <span className="text-gray-900 capitalize">
              {fileStatus.status || ""}
            </span>
            <span className="text-gray-400">Resolutions</span>
            <span className="text-gray-900">
              {fileStatus.resolutions?.join(", ") || "—"}
            </span>
          </div>

          {fileStatus.transcodedFiles &&
            Object.keys(fileStatus.transcodedFiles).length > 0 && (
              <>
                <div className="h-px bg-gray-50" />
                <div className="space-y-1">
                  <p className="text-sm text-gray-400 mb-2">Download</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(fileStatus.transcodedFiles).map(
                      ([res, filepath]) => {
                        const filename = filepath.split("/").pop() || filepath;
                        return (
                          <a
                            key={res}
                            href={`/api/v1/download?file=${filename}`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            <Download className="size-3.5" />
                            {res}
                          </a>
                        );
                      },
                    )}
                  </div>
                </div>
              </>
            )}
        </div>
      )}
    </>
  );
}
