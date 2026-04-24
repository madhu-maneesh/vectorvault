package com.vectorvault.docqa.Service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.googleai.GoogleAiEmbeddingModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import dev.langchain4j.data.document.splitter.DocumentSplitters;


import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {
    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    @Autowired
    GoogleAiGeminiChatModel chatModel;

    private EmbeddingModel embeddingModel;
    private EmbeddingStore<TextSegment> store;

    @PostConstruct
    public void init() {
        this.embeddingModel = GoogleAiEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName("gemini-embedding-001")
                .taskType(GoogleAiEmbeddingModel.TaskType.RETRIEVAL_DOCUMENT)
                .build();

        this.store = new InMemoryEmbeddingStore<>();
    }


    public String callApi(String msg) {

        EmbeddingModel queryModel = GoogleAiEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName("gemini-embedding-001")
                .taskType(GoogleAiEmbeddingModel.TaskType.RETRIEVAL_QUERY)  // for querying
                .build();


        // 1. Convert query → embedding (unwrap Response)
        Embedding queryEmbedding = queryModel.embed(msg).content();

        // 2. Build search request
        EmbeddingSearchRequest request = EmbeddingSearchRequest.builder()
                .queryEmbedding(queryEmbedding)
                .maxResults(8)
                .build();

        // 3. Search in vector store
        var matches = store.search(request).matches();
        
        // 4. Build context from retrieved chunks
        StringBuilder context = new StringBuilder();
        for (var match : matches) {
            context.append(match.embedded().text()).append("\n");
        }

        // 5. Safer prompt (prevents hallucination)
        String prompt = String.format(
                "You are a document assistant.\n\n" +
                        "Answer ONLY from the context below.\n" +
                        "If the answer is not present, say: I don't know.\n\n" +
                        "Context:\n%s\n\n" +
                        "Question:\n%s\n\n" +
                        "Answer:",
                context.toString(),
                msg
        );

        return chatModel.generate(prompt);
    }

    public String upload(MultipartFile file) {
        try {
            InputStream is = file.getInputStream();
            Document document = new ApachePdfBoxDocumentParser().parse(is);
            // rest of code

            var splitter = DocumentSplitters.recursive(1000, 200);
            List<TextSegment> segments = splitter.split(document);

        // convert segments → text
            List<Embedding> embeddings = new ArrayList<>();

            for (TextSegment segment : segments) {
                Embedding embedding = embeddingModel.embed(segment.text()).content();
                embeddings.add(embedding);
            }
        // embed
//            List<Embedding> embeddings = embeddingModel.embedAll(texts);

        // store
            store.addAll(embeddings, segments);
            return "Document processed and stored";

        } catch (IOException e) {
            return "Failed to read file: " + e.getMessage();
        }

    }
}
