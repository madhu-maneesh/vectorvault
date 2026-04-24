import { useState, useRef, useEffect } from "react";

const BASE_URL = "http://localhost:8080";

const DBIcon = ({ color = "#3b82f6", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <ellipse cx="8" cy="4" rx="5" ry="2" stroke={color} strokeWidth="1.5" />
    <path d="M3 4v4c0 1.1 2.24 2 5 2s5-.9 5-2V4" stroke={color} strokeWidth="1.5" />
    <path d="M3 8v4c0 1.1 2.24 2 5 2s5-.9 5-2V8" stroke={color} strokeWidth="1.5" />
  </svg>
);

export default function Homepage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const isUploaded = uploadStatus === "success";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUpload = async () => {
  if (!file) return;
  setUploading(true);
  setUploadStatus(null);
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch(`${BASE_URL}/upload`, { method: "POST", body: formData });
    const text = await res.text();
    console.log("Status:", res.status, "Response:", text); // ← ADD THIS
    if (res.ok) {
      setUploadStatus("success");
      setUploadMsg(text);
      setActiveTab("chat");
    } else {
      setUploadStatus("error");
      setUploadMsg("Upload failed. Please try again.");
    }
  } catch (e) {
    console.log("Error:", e); // ← AND THIS
    setUploadStatus("error");
    setUploadMsg("Could not reach server.");
  } finally {
    setUploading(false);
  }
};
  const handleChat = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    if (!isUploaded) {
      setMessages((prev) => [...prev, { role: "ai", text: "⚠️ Please upload a document first before asking questions." }]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/chat?msg=${encodeURIComponent(trimmed)}`);
      const text = await res.text();
      setMessages((prev) => [...prev, { role: "ai", text }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Error: Could not reach server." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChat(); }
  };

  // ── shared UI pieces ──────────────────────────────────────────
  const leftPanel = (
    <div className="flex flex-col gap-5 p-5 h-full overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
            <DBIcon color="white" size={16} />
          </div>
          <span className="text-xl font-semibold text-blue-900 tracking-tight">VectorVault</span>
        </div>
        <p className="text-xs text-blue-400 ml-10">Upload a document. Ask anything.</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200
          ${isUploaded ? "border-blue-300 bg-blue-100/60" : "border-blue-200 bg-white/60 hover:border-blue-400 hover:bg-blue-100/40"}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const d = e.dataTransfer.files[0]; if (d) { setFile(d); setUploadStatus(null); setUploadMsg(""); } }}
      >
        <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => { setFile(e.target.files[0]); setUploadStatus(null); setUploadMsg(""); }} />
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
          {isUploaded ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M5 11L9 15L17 7" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 14V4M11 4L7 8M11 4L15 8" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16V17C4 18.1 4.9 19 6 19H16C17.1 19 18 18.1 18 17V16" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <p className="text-sm font-semibold text-blue-800 break-all">{file ? file.name : "Click or drag a PDF here"}</p>
        <p className="text-xs text-blue-400 mt-1">{file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF up to 10MB"}</p>
      </div>

      <button onClick={handleUpload} disabled={!file || uploading}
        className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow-sm
          ${!file || uploading ? "bg-blue-300 cursor-not-allowed" : isUploaded ? "bg-blue-400 cursor-default" : "bg-blue-500 hover:bg-blue-600 active:scale-95 cursor-pointer"}`}>
        {uploading ? "Uploading..." : isUploaded ? "✓ Uploaded" : "Upload Document"}
      </button>

      {uploadMsg && (
        <div className={`text-xs px-3 py-2 rounded-lg -mt-2 ${uploadStatus === "success" ? "bg-blue-100 text-blue-600 border border-blue-200" : "bg-red-50 text-red-500 border border-red-200"}`}>
          {uploadMsg}
        </div>
      )}

      <div className="mt-auto pt-4">
        <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-3">How it works</p>
        <div className="flex flex-col gap-3">
          {["Upload your PDF document", "Ask questions in the chat", "Get answers from the document"].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 text-xs font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</div>
              <span className="text-sm text-blue-600">{step}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-blue-300 text-center">Session-based · nothing stored</p>
    </div>
  );

  const chatPanel = (
    <div className="flex flex-col flex-1 overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-blue-100 flex items-center gap-3 bg-white/70 backdrop-blur-sm flex-shrink-0">
        <span className="text-base font-semibold text-blue-900">Chat</span>
        {isUploaded && (
          <span className="text-xs bg-blue-100 text-blue-500 border border-blue-200 px-3 py-1 rounded-full max-w-xs truncate">{file?.name}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center pt-10">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M5 21L9 17H22C23.1 17 24 16.1 24 15V6C24 4.9 23.1 4 22 4H6C4.9 4 4 4.9 4 6V21Z" stroke="#93c5fd" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
                <path d="M8 10H20M8 14H15" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700">{isUploaded ? "Document ready! Ask anything." : "Upload a document to begin."}</p>
              <p className="text-xs text-blue-400 mt-1">Your file stays in this session.</p>
            </div>
            {isUploaded && (
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                {["What are the key skills?", "Summarize this document", "What is the main topic?"].map((s) => (
                  <button key={s} onClick={() => setInput(s)}
                    className="text-xs px-4 py-2 rounded-full border border-blue-200 bg-white/80 text-blue-500 hover:bg-blue-100 transition-colors cursor-pointer">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-1">
                <DBIcon color="#3b82f6" size={14} />
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === "user" ? "bg-blue-500 text-white rounded-br-sm shadow-sm" : "bg-white/90 text-blue-900 rounded-bl-sm shadow-sm border border-blue-100"}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
              <DBIcon color="#3b82f6" size={14} />
            </div>
            <div className="bg-white/90 border border-blue-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center shadow-sm">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-blue-300" style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="px-4 py-4 border-t border-blue-100 bg-white/70 backdrop-blur-sm flex gap-3 items-end flex-shrink-0">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isUploaded ? "Ask something about your document..." : "Ask a question..."}
          className="flex-1 resize-none rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm text-blue-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-blue-300"
          style={{ minHeight: "46px", maxHeight: "120px" }}
        />
        <button onClick={handleChat} disabled={!input.trim() || loading}
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm
            ${!input.trim() || loading ? "bg-blue-200 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 active:scale-95 cursor-pointer"}`}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 14V4M9 4L5 8M9 4L13 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-blue-50 font-sans">

      {/* DESKTOP */}
      <div className="hidden md:flex w-full h-full">
        <div className="w-80 min-w-72 flex flex-col border-r border-blue-200 bg-blue-50/80">{leftPanel}</div>
        <div className="flex-1 flex flex-col overflow-hidden bg-blue-50/40">{chatPanel}</div>
      </div>

      {/* MOBILE */}
      <div className="flex md:hidden w-full h-full flex-col">
        <div className="flex border-b border-blue-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
          {["upload", "chat"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors
                ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50/50" : "text-blue-300 hover:text-blue-400"}`}>
              {tab}
              {tab === "chat" && messages.length > 0 && (
                <span className="ml-1.5 text-xs bg-blue-100 text-blue-500 px-1.5 py-0.5 rounded-full">{messages.length}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-hidden">
          {activeTab === "upload"
            ? <div className="h-full overflow-y-auto">{leftPanel}</div>
            : <div className="h-full flex flex-col">{chatPanel}</div>
          }
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}