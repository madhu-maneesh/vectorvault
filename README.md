# VectorVault 🗄️

A full-stack **RAG (Retrieval-Augmented Generation)** application that allows users to upload documents and interact with them using AI-powered semantic search and contextual responses.

---

## 🚀 Features

- 📄 Upload PDF documents
- 🔍 Semantic search using vector embeddings
- 🧠 Context-aware answers using Google Gemini
- ⚡ Fast similarity search using Pinecone vector database
- 💬 Chat-based UI for natural interaction
- 📱 Responsive frontend built with React + Tailwind CSS

---

## 🛠️ Tech Stack

### 🔹 Backend

| Technology | Purpose |
|---|---|
| Java 17 | Core language |
| Spring Boot | REST API framework |
| LangChain4j | RAG pipeline orchestration |
| Google Gemini 2.5 Flash | LLM for answer generation |
| Gemini Embedding 001 | Text embeddings |
| Apache PDFBox | PDF parsing |
| Pinecone | Persistent vector database |

### 🔹 Frontend

| Technology | Purpose |
|---|---|
| React | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Fetch API | Backend communication |

---

## 📁 Project Structure

```
VectorVault/
├── backend/
│   ├── src/main/java/com/vectorvault/docqa/
│   │   ├── Controller/
│   │   ├── Service/
│   │   ├── Configurations/
│   │   └── DocqaApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── application-local.properties   ← not committed
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   └── components/
    │       └── Homepage.jsx
    ├── package.json
    └── tailwind.config.js
```

---

## ⚙️ How It Works (RAG Pipeline)

```
User uploads PDF
        ↓
PDF parsed using Apache PDFBox
        ↓
Text split into 500-character chunks (100-char overlap)
        ↓
Each chunk converted to vector embeddings using Gemini Embedding 001
        ↓
Embeddings stored in Pinecone vector database
        ↓
User asks a question
        ↓
Query converted to embedding using same model
        ↓
Top-K similar chunks retrieved from Pinecone via cosine similarity
        ↓
Retrieved context + original question sent to Gemini 2.5 Flash
        ↓
AI generates final context-aware answer
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload` | Upload a PDF document |
| GET | `/chat?msg={question}` | Ask a question about the document |

### Example Usage

**Upload a PDF:**
```bash
curl -X POST http://localhost:8080/upload \
  -F "file=@document.pdf"
```

**Ask a question:**
```bash
curl "http://localhost:8080/chat?msg=What%20are%20the%20key%20skills?"
```

---

## 🖥️ Setup & Installation

### 🔧 Prerequisites

- Java 17+
- Node.js 18+
- Maven
- Pinecone Account — [pinecone.io](https://pinecone.io)
- Google Gemini API Key — [aistudio.google.com](https://aistudio.google.com)

---

### ⚙️ Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/madhu-maneesh/vectorvault.git
cd vectorvault/backend
```

2. **Create environment config**

Create `application-local.properties` inside `src/main/resources/`:
```properties
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_HOST=https://docqa-xxxx.svc.pinecone.io
```

> ⚠️ This file is in `.gitignore` — never commit your API keys.

3. **Run the backend**
```bash
mvn spring-boot:run
```

Backend starts at `http://localhost:8080`

---

### 🎨 Frontend Setup

1. **Navigate to frontend folder**
```bash
cd vectorvault/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the frontend**
```bash
npm run dev
```

Frontend starts at `http://localhost:5173`

---

## 📊 Example Flow

1. Open `http://localhost:5173`
2. Upload a PDF — resume, research paper, any document
3. Ask: *"What are the key skills?"*
4. System retrieves the most relevant chunks from Pinecone
5. Gemini generates a structured, context-aware response

---

## ⚠️ Limitations

- Supports **PDF files only**
- **Single document per session** — uploading a new PDF replaces the previous one
- Document data requires re-upload on server restart (Pinecone is persistent but session context resets)
- No chat history persistence yet

---

## 🔮 Future Improvements

- [ ] Multi-document support using Pinecone namespaces
- [ ] Chat history memory across sessions
- [ ] DOCX and TXT file support
- [ ] Streaming responses
- [ ] User authentication and per-user document isolation
- [ ] Cloud deployment (Railway / Render / Vercel)

---

## 👨‍💻 Author

**Madhu Maneesh**  
Full-stack developer focused on building AI-powered systems using Spring Boot + React.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/in/shetty-madhu-maneesh)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/madhu-maneesh)
