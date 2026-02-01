import { api } from "@/app/lib/api";
import TestcaseEditor from "./TestcaseEditor";
import { notFound } from "next/navigation";

export default async function TestcasesPage({
    params,
}: Readonly<{
    params: Promise<{ id: string }>;
}>) {
    const problem = await api.getProblem((await params).id);
    const samples = problem ? await api.getTestcases(problem.id) : null;

    if (!samples) {
        notFound();
    }

    return (
        <TestcaseEditor
            testcaseSetId={problem.testcaseSetId}
            initialTestcases={samples}
            problemId={problem.id}
            problemName={problem.title}
        />
    );
}
