import { NextRequest, NextResponse } from "next/server";
import { translateWithOllama, batchTranslateWithOllama, isOllamaAvailable } from "@/app/lib/ollama";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, texts, targetLanguage, sourceLanguage = "en" } = body;

        if (!targetLanguage) {
            return NextResponse.json(
                { error: "Missing targetLanguage parameter" },
                { status: 400 }
            );
        }

        // Check if Ollama is available
        const available = await isOllamaAvailable();
        if (!available) {
            return NextResponse.json(
                { error: "Ollama server is not available. Please start it first." },
                { status: 503 }
            );
        }

        let result;

        // Handle batch translation
        if (texts && Array.isArray(texts)) {
            const translatedTexts = await batchTranslateWithOllama(
                texts,
                targetLanguage,
                sourceLanguage
            );
            result = { translations: translatedTexts };
        }
        // Handle single translation
        else if (text) {
            const translated = await translateWithOllama(
                text,
                targetLanguage,
                sourceLanguage
            );
            result = { translation: translated };
        } else {
            return NextResponse.json(
                { error: "Missing text or texts parameter" },
                { status: 400 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Translation API error:", error);
        return NextResponse.json(
            {
                error: "Failed to translate text",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const available = await isOllamaAvailable();
        return NextResponse.json({
            status: available ? "available" : "unavailable",
            message: available
                ? "Ollama server is running"
                : "Ollama server is not accessible",
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
