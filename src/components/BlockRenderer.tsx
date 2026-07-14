import React, { useState } from "react";
import { PostBlock } from "../types.js";
import { FileDown, Code, Play, Check, Copy } from "lucide-react";
import { useLanguage } from "../i18n.js";

interface BlockRendererProps {
  block: PostBlock;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  const { type, data, id } = block;
  const { t } = useLanguage();

  switch (type) {
    case "RICH_TEXT": {
      return (
        <div 
          className="prose max-w-none text-neutral-700 leading-relaxed space-y-4 text-start"
          dangerouslySetInnerHTML={{ __html: data.html || "" }}
        />
      );
    }

    case "IMAGE": {
      return (
        <figure className="my-8 space-y-2">
          <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm bg-neutral-100">
            <img 
              src={data.url || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"} 
              alt={data.alt || ""} 
              className="w-full h-auto object-cover max-h-[500px]"
              referrerPolicy="no-referrer"
            />
          </div>
          {(data.caption || data.alt) && (
            <figcaption className="text-center text-xs text-neutral-500 font-mono italic">
              {data.caption || data.alt}
            </figcaption>
          )}
        </figure>
      );
    }

    case "APARAT_EMBED": {
      // Parse Aparat ID from common URL formats or use it directly
      const getAparatId = (input: string) => {
        if (!input) return "";
        const cleaned = input.trim();
        // Match formats like https://www.aparat.com/v/abc1234 or v/abc1234
        const match = cleaned.match(/v\/([a-zA-Z0-9]+)/);
        if (match && match[1]) return match[1];
        return cleaned;
      };

      const aparatId = getAparatId(data.videoId || data.url || "");

      if (!aparatId) {
        return (
          <div className="bg-neutral-100 border border-dashed border-neutral-300 p-6 rounded-xl flex items-center justify-center text-neutral-500 text-sm font-mono my-6 text-start">
            <Play className="w-5 h-5 me-2 text-neutral-400 shrink-0" /> {t("block_invalid_video")}
          </div>
        );
      }

      return (
        <div className="my-8 space-y-2">
          <div className="aparat-container border border-neutral-200 shadow-md">
            <iframe 
              src={`https://www.aparat.com/video/video/embed/videohash/${aparatId}/vt/frame`} 
              allowFullScreen={true}
              title={`Aparat Video ${aparatId}`}
            />
          </div>
          {data.title && (
            <p className="text-xs text-center text-neutral-500 font-medium">
              {data.title}
            </p>
          )}
        </div>
      );
    }

    case "CODE_SNIPPET": {
      const [copied, setCopied] = useState(false);
      const codeText = data.code || "";
      const language = data.language || "typescript";

      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(codeText);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy code: ", err);
        }
      };

      return (
        <div className="my-6 rounded-xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-900 text-neutral-100">
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-950 border-b border-neutral-800">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center">
              <Code className="w-4 h-4 me-1.5 text-brand" /> {language}
            </span>
            <button 
              onClick={handleCopy}
              className="flex items-center text-xs font-mono text-neutral-400 hover:text-neutral-100 transition-colors py-1 px-2 rounded hover:bg-neutral-800 cursor-pointer"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 me-1 text-emerald-500" />
                  {t("home_copied")}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 me-1" />
                  {t("home_copy_snippet")}
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono text-start" dir="ltr">
            <code>{codeText}</code>
          </pre>
        </div>
      );
    }

    case "DOWNLOAD_BOX": {
      const downloadUrl = id ? `/downloads/${id}` : (data.link || "#");
      
      return (
        <div className="my-6 p-5 rounded-xl border border-neutral-200 bg-white hover:border-brand/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-start">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-lg bg-emerald-50 text-brand shrink-0">
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-neutral-900 tracking-tight">
                {data.filename || t("block_attachment_file")}
              </h4>
              <p className="text-xs font-mono text-neutral-500 mt-0.5">
                {t("home_download_stats")}: {data.size || t("block_unknown_size")} • {data.downloads || 0} {t("block_downloads_count")}
              </p>
              {data.description && (
                <p className="text-sm text-neutral-600 mt-1.5">
                  {data.description}
                </p>
              )}
            </div>
          </div>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4.5 py-2.5 rounded-lg bg-neutral-900 text-white font-medium text-sm hover:bg-brand transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <FileDown className="w-4 h-4 me-1.5" /> {t("block_trigger_download")}
          </a>
        </div>
      );
    }

    default:
      return null;
  }
}
