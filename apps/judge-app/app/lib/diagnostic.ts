/**
 * Diagnostic utilities for debugging API issues
 */

import { checkOllamaHealth, analyzeCodeWithOllama } from "./backendServer";

export async function testOllamaConnection() {
    console.log("=== Testing Ollama Connection ===");
    
    // Check environment
    console.log({
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
        NEXT_PUBLIC_EXCHANGE_KEY: process.env.NEXT_PUBLIC_EXCHANGE_KEY ? "[SET]" : "[NOT SET]",
    });

    // Test health check
    console.log("\n[1] Checking Ollama health...");
    const healthResponse = await checkOllamaHealth();
    console.log("Health response:", healthResponse);

    if (!healthResponse.data?.available) {
        console.error("Ollama server not available");
        return false;
    }

    // Test analysis
    console.log("\n[2] Testing code analysis...");
    const analysisResponse = await analyzeCodeWithOllama({
        sourceCode: "function add(a, b) { return a + b; }",
        language: "javascript",
        testResults: {
            passed: 2,
            total: 4,
            failedTests: [
                { input: "add(1, 2)", expected: "3", output: "undefined" },
                { input: "add(0, 0)", expected: "0", output: "undefined" }
            ]
        },
        targetLanguage: "en"
    });
    
    console.log("Analysis response:", analysisResponse);
    
    if (analysisResponse.error) {
        console.error("Analysis failed:", analysisResponse.error);
        return false;
    }

    console.log("All tests passed!");
    console.log("Response data:", analysisResponse.data);
    return true;
}
