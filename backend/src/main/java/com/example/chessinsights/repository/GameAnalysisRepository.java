package com.example.chessinsights.repository;

import com.example.chessinsights.model.GameAnalysisDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GameAnalysisRepository extends MongoRepository<GameAnalysisDocument, String> {
}