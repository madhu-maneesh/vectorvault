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
import dev.langchain4j.store.embedding.pinecone.PineconeEmbeddingStore;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import dev.langchain4j.data.document.splitter.DocumentSplitters;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    @Value("${pinecone.api-key}")
    private String pineconeKey;

//    @Value("${pinecone.environment}")
//    private String environment;

    @Value("${pinecone.index-name}")
    private String index;

    @Autowired
    GoogleAiGeminiChatModel chatModel;

    private EmbeddingModel embeddingModel;
    private EmbeddingStore<TextSegment> store;

    @PostConstruct
    public void init() {

        // For document embeddings
        this.embeddingModel = GoogleAiEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName("gemini-embedding-001")
                .taskType(GoogleAiEmbeddingModel.TaskType.RETRIEVAL_DOCUMENT)
                .build();

        
        this.store = PineconeEmbeddingStore.builder()
                .apiKey(pineconeKey)
                .index(index)
                .build();
    }

    public String upload(MultipartFile file) {
        try {
            InputStream is = file.getInputStream();
            Document document = new ApachePdfBoxDocumentParser().parse(is);

            var splitter = DocumentSplitters.recursive(1000, 200);
            List<TextSegment> segments = splitter.split(document);

            List<Embedding> embeddings = new ArrayList<>();

            for (TextSegment segment : segments) {
                embeddings.add(embeddingModel.embed(segment.text()).content());
            }

            store.addAll(embeddings, segments);

            return "success";

        } catch (Exception e) {
            return "error: " + e.getMessage();
        }
    }

    public String callApi(String msg) {

        // Query embedding model
        EmbeddingModel queryModel = GoogleAiEmbeddingModel.builder()
                .apiKey(apiKey)
                .modelName("gemini-embedding-001")
                .taskType(GoogleAiEmbeddingModel.TaskType.RETRIEVAL_QUERY)
                .build();

        Embedding queryEmbedding = queryModel.embed(msg).content();

        EmbeddingSearchRequest request = EmbeddingSearchRequest.builder()
                .queryEmbedding(queryEmbedding)
                .maxResults(5)
                .build();

        var matches = store.search(request).matches();

        if (matches.isEmpty()) {
            return "I don't know based on the document.";
        }

        StringBuilder context = new StringBuilder();
        for (var m : matches) {
            context.append(m.embedded().text()).append("\n");
        }

        String prompt = String.format(
                "Answer ONLY from the context.\n\nContext:\n%s\n\nQuestion:\n%s",
                context.toString(),
                msg
        );

        return chatModel.generate(prompt);
    }
}