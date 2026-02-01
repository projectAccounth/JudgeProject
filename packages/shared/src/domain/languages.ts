export interface LanguageConfig {
    extension: string;
    compile?: string[];
    run: string[];
}

export const LANGUAGES = {
    python: {
        extension: "py",
        run: ["python3", "/sandbox/src/Main.py"],
    },

    c: {
        extension: "c",
        compile: [
            "gcc",
            "/sandbox/src/Main.c",
            "-O2",
            "-o",
            "/sandbox/out/main",
        ],
        run: ["/sandbox/out/main"],
    },

    cpp: {
        extension: "cpp",
        compile: [
            "g++",
            "/sandbox/src/Main.cpp",
            "-O2",
            "-std=gnu++20",
            "-o",
            "/sandbox/out/main",
        ],
        run: ["/sandbox/out/main"],
    },

    java: {
        extension: "java",
        compile: [
            "javac",
            "/sandbox/src/Main.java",
            "-d",
            "/sandbox/out",
        ],
        run: ["java", "-cp", "/sandbox/out", "Main"],
    },
} satisfies Record<string, LanguageConfig>;

export type Language = keyof typeof LANGUAGES;