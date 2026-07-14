import React, { useState } from "react";
import { PostBlock } from "../types.js";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Plus, 
  Type, 
  Image as ImageIcon, 
  Play, 
  Code, 
  FileDown,
  FolderOpen,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered
} from "lucide-react";
import { MediaModal } from "./MediaModal.js";
import { useLanguage } from "../i18n.js";

// Simplified Tiptap rich text wrapper for each rich text block
function TiptapEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
      {/* Menu Bar */}
      <div className="flex flex-wrap gap-1 p-1.5 bg-neutral-50 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 transition-colors ${editor.isActive("bold") ? "bg-neutral-200 text-brand" : "text-neutral-600"}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 transition-colors ${editor.isActive("italic") ? "bg-neutral-200 text-brand" : "text-neutral-600"}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-neutral-200 transition-colors ${editor.isActive("heading", { level: 1 }) ? "bg-neutral-200 text-brand" : "text-neutral-600"}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-neutral-200 transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-neutral-200 text-brand" : "text-neutral-600"}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 transition-colors ${editor.isActive("bulletList") ? "bg-neutral-200 text-brand" : "text-neutral-600"}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 transition-colors ${editor.isActive("orderedList") ? "bg-neutral-200 text-brand" : "text-neutral-600"}`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-3 min-h-[140px] focus-within:outline-none prose max-w-none text-sm text-neutral-800 text-start">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

interface BlockEditorProps {
  blocks: PostBlock[];
  onChange: (blocks: PostBlock[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [activeMediaBlockIndex, setActiveMediaBlockIndex] = useState<number | null>(null);
  const [activeMediaTarget, setActiveMediaTarget] = useState<"image_url" | "download_link">("image_url");
  const { t } = useLanguage();

  const blockTypeKeys: Record<string, string> = {
    "RICH_TEXT": "blocks_type_rich_text",
    "IMAGE": "blocks_type_image",
    "APARAT_EMBED": "blocks_type_aparat_embed",
    "CODE_SNIPPET": "blocks_type_code_snippet",
    "DOWNLOAD_BOX": "blocks_type_download_box"
  };

  // Move block up
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index - 1];
    newBlocks[index - 1] = temp;
    // Reassign orders
    newBlocks.forEach((b, i) => (b.order = i));
    onChange(newBlocks);
  };

  // Move block down
  const moveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + 1];
    newBlocks[index + 1] = temp;
    // Reassign orders
    newBlocks.forEach((b, i) => (b.order = i));
    onChange(newBlocks);
  };

  // Delete block
  const deleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    newBlocks.forEach((b, i) => (b.order = i));
    onChange(newBlocks);
  };

  // Update specific block data
  const updateBlockData = (index: number, updatedData: any) => {
    const newBlocks = [...blocks];
    newBlocks[index] = {
      ...newBlocks[index],
      data: {
        ...newBlocks[index].data,
        ...updatedData
      }
    };
    onChange(newBlocks);
  };

  // Add new block
  const addBlock = (type: PostBlock["type"]) => {
    let initialData = {};
    if (type === "RICH_TEXT") {
      initialData = { html: "<p>Write something elegant...</p>" };
    } else if (type === "IMAGE") {
      initialData = { url: "", alt: "", caption: "" };
    } else if (type === "APARAT_EMBED") {
      initialData = { videoId: "", title: "" };
    } else if (type === "CODE_SNIPPET") {
      initialData = { language: "typescript", code: "// Your code here" };
    } else if (type === "DOWNLOAD_BOX") {
      initialData = { filename: "tutorial-files.zip", size: "1.2 MB", link: "", downloads: 0, description: "" };
    }

    const newBlock: PostBlock = {
      type,
      order: blocks.length,
      data: initialData
    };

    onChange([...blocks, newBlock]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">{t("blocks_title")}</h3>
        <p className="text-xs font-mono text-neutral-500">{blocks.length} {t("blocks_count")}</p>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-200 bg-neutral-50/50 rounded-xl">
          <p className="text-sm text-neutral-500">{t("blocks_empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, index) => {
            const isFirst = index === 0;
            const isLast = index === blocks.length - 1;

            return (
              <div 
                key={index} 
                className="group relative bg-neutral-50 hover:bg-neutral-100/60 border border-neutral-200 hover:border-neutral-300 rounded-xl p-4 transition-all"
              >
                {/* Block Controls */}
                <div className="absolute end-4 top-4 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity bg-white border border-neutral-200 rounded-lg p-0.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={isFirst}
                    className="p-1 rounded text-neutral-500 hover:text-neutral-900 disabled:opacity-30 hover:bg-neutral-100"
                    title={t("blocks_move_up")}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={isLast}
                    className="p-1 rounded text-neutral-500 hover:text-neutral-900 disabled:opacity-30 hover:bg-neutral-100"
                    title={t("blocks_move_down")}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-neutral-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => deleteBlock(index)}
                    className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50"
                    title={t("blocks_delete")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Block Title & Indicator */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-1.5 rounded-lg bg-neutral-200 text-neutral-700">
                    {block.type === "RICH_TEXT" && <Type className="w-4 h-4" />}
                    {block.type === "IMAGE" && <ImageIcon className="w-4 h-4" />}
                    {block.type === "APARAT_EMBED" && <Play className="w-4 h-4" />}
                    {block.type === "CODE_SNIPPET" && <Code className="w-4 h-4" />}
                    {block.type === "DOWNLOAD_BOX" && <FileDown className="w-4 h-4" />}
                  </span>
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                    {t(blockTypeKeys[block.type] || block.type.replace("_", " "))}
                  </span>
                </div>

                {/* Block Specific Form Inputs */}
                <div className="mt-2.5">
                  {block.type === "RICH_TEXT" && (
                    <TiptapEditor 
                      value={block.data.html || ""} 
                      onChange={(html) => updateBlockData(index, { html })}
                    />
                  )}

                  {block.type === "IMAGE" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-700 text-start block">{t("blocks_img_url")}</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={block.data.url || ""}
                            onChange={(e) => updateBlockData(index, { url: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="flex-1 text-sm bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand text-start"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMediaBlockIndex(index);
                              setActiveMediaTarget("image_url");
                            }}
                            className="p-1.5 bg-neutral-200 hover:bg-brand hover:text-white rounded-lg transition-colors flex items-center shrink-0"
                            title={t("blocks_browse_media")}
                          >
                            <FolderOpen className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-700 text-start block">{t("blocks_img_alt")}</label>
                          <input
                            type="text"
                            value={block.data.alt || ""}
                            onChange={(e) => updateBlockData(index, { alt: e.target.value })}
                            placeholder="Image accessibility text"
                            className="w-full text-sm bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand text-start"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-700 text-start block">{t("blocks_img_caption")}</label>
                          <input
                            type="text"
                            value={block.data.caption || ""}
                            onChange={(e) => updateBlockData(index, { caption: e.target.value })}
                            placeholder="Optional figcaption"
                            className="w-full text-sm bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand text-start"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {block.type === "APARAT_EMBED" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-700 text-start block">{t("blocks_video_id")}</label>
                        <input
                          type="text"
                          value={block.data.videoId || block.data.url || ""}
                          onChange={(e) => updateBlockData(index, { videoId: e.target.value, url: e.target.value })}
                          placeholder="e.g. gNf67 or https://www.aparat.com/v/gNf67"
                          className="w-full text-sm bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand text-start"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-700 text-start block">{t("blocks_video_title")}</label>
                        <input
                          type="text"
                          value={block.data.title || ""}
                          onChange={(e) => updateBlockData(index, { title: e.target.value })}
                          placeholder="Business Pitch Tutorial"
                          className="w-full text-sm bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand text-start"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "CODE_SNIPPET" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-neutral-700">{t("blocks_code_editor")}</label>
                        <select
                          value={block.data.language || "typescript"}
                          onChange={(e) => updateBlockData(index, { language: e.target.value })}
                          className="text-xs font-mono bg-white border border-neutral-300 rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="typescript">TypeScript</option>
                          <option value="javascript">JavaScript</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="python">Python</option>
                          <option value="bash">Bash / Shell</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>
                      <textarea
                        rows={5}
                        value={block.data.code || ""}
                        onChange={(e) => updateBlockData(index, { code: e.target.value })}
                        placeholder={t("blocks_code_placeholder")}
                        className="w-full p-3 font-mono text-xs bg-neutral-900 text-neutral-100 rounded-lg focus:outline-none text-start"
                      />
                    </div>
                  )}

                  {block.type === "DOWNLOAD_BOX" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-700 text-start block">{t("blocks_file_name")}</label>
                          <input
                            type="text"
                            value={block.data.filename || ""}
                            onChange={(e) => updateBlockData(index, { filename: e.target.value })}
                            placeholder="marketing-workbook.pdf"
                            className="w-full text-sm bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand text-start"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-700 text-start block">{t("blocks_file_size")}</label>
                          <input
                            type="text"
                            value={block.data.size || ""}
                            onChange={(e) => updateBlockData(index, { size: e.target.value })}
                            placeholder="e.g. 4.8 MB"
                            className="w-full text-sm bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand text-start"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-neutral-700 text-start block">{t("blocks_file_link")}</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={block.data.link || ""}
                              onChange={(e) => updateBlockData(index, { link: e.target.value })}
                              placeholder="/uploads/my-file.zip"
                              className="flex-1 text-sm bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand text-start"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMediaBlockIndex(index);
                                setActiveMediaTarget("download_link");
                              }}
                              className="p-1.5 bg-neutral-200 hover:bg-brand hover:text-white rounded-lg transition-colors flex items-center shrink-0"
                              title={t("blocks_browse_media")}
                            >
                              <FolderOpen className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-700 text-start block">{t("blocks_file_desc")}</label>
                        <input
                          type="text"
                          value={block.data.description || ""}
                          onChange={(e) => updateBlockData(index, { description: e.target.value })}
                          placeholder="Workbook containing all slides, business model templates, and formulas."
                          className="w-full text-sm bg-white border border-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand text-start"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Insert Block Toolbar */}
      <div className="border border-dashed border-neutral-300 rounded-xl p-4 bg-neutral-50 flex flex-col items-center justify-center gap-3">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{t("blocks_insert_title")}</span>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => addBlock("RICH_TEXT")}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-brand hover:text-brand text-sm font-medium transition-all shadow-xs cursor-pointer"
          >
            <Type className="w-4 h-4 me-1.5 text-neutral-500" /> {t("blocks_type_rich_text")}
          </button>
          <button
            type="button"
            onClick={() => addBlock("IMAGE")}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-brand hover:text-brand text-sm font-medium transition-all shadow-xs cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 me-1.5 text-neutral-500" /> {t("blocks_type_image")}
          </button>
          <button
            type="button"
            onClick={() => addBlock("APARAT_EMBED")}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-brand hover:text-brand text-sm font-medium transition-all shadow-xs cursor-pointer"
          >
            <Play className="w-4 h-4 me-1.5 text-neutral-500" /> {t("blocks_type_aparat_embed")}
          </button>
          <button
            type="button"
            onClick={() => addBlock("CODE_SNIPPET")}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-brand hover:text-brand text-sm font-medium transition-all shadow-xs cursor-pointer"
          >
            <Code className="w-4 h-4 me-1.5 text-neutral-500" /> {t("blocks_type_code_snippet")}
          </button>
          <button
            type="button"
            onClick={() => addBlock("DOWNLOAD_BOX")}
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-brand hover:text-brand text-sm font-medium transition-all shadow-xs cursor-pointer"
          >
            <FileDown className="w-4 h-4 me-1.5 text-neutral-500" /> {t("blocks_type_download_box")}
          </button>
        </div>
      </div>

      {/* Media Selector Modal */}
      {activeMediaBlockIndex !== null && (
        <MediaModal
          onClose={() => setActiveMediaBlockIndex(null)}
          onSelect={(url, filename, size) => {
            if (activeMediaBlockIndex !== null) {
              if (activeMediaTarget === "image_url") {
                updateBlockData(activeMediaBlockIndex, { url });
              } else if (activeMediaTarget === "download_link") {
                updateBlockData(activeMediaBlockIndex, { 
                  link: url,
                  filename: filename || "downloaded-file",
                  size: size || "Unknown Size"
                });
              }
              setActiveMediaBlockIndex(null);
            }
          }}
        />
      )}
    </div>
  );
}
