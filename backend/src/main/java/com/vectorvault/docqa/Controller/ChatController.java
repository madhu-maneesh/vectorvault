package com.vectorvault.docqa.Controller;

import com.vectorvault.docqa.Service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController()
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {
    @Autowired
    ChatService c;

    @GetMapping("/")
    public String greet(){
        return "hello";
    }

    @GetMapping("/chat")
    public String call(@RequestParam String msg){
        return c.callApi(msg);
    }

    @PostMapping("/upload")
    public String upload(@RequestParam("file") MultipartFile file) {
        
        return c.upload(file);
    }

}
