"use client";

import Editor from "@monaco-editor/react";

export default function CodeEditor({
    value,
    language,
    onChange,
    readOnly = false,
}: Readonly<{
    value: string;
    language: string;
    onChange: (v: string) => void;
    readOnly?: boolean;
}>) {
    return (
        <Editor
            height="400px"
            language={language}
            theme="vs-dark"
            value={value}
            onChange={(v?: string) => onChange(v ?? "")}
            options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                readOnly: readOnly,
                padding: {
                    top: 8
                }
            }}
        />
    );
}
