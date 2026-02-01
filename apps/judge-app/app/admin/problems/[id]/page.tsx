import { api } from "@/app/lib/api";
import ProblemEditor from "./ProblemEditor";
import { notFound } from "next/navigation";

export default async function ProblemEditPage({
    params,
}: Readonly<{
    params: Promise<{ id: string }>;
}>) {
    const problem = await api.getProblem((await params).id);

    if (!problem) {
        notFound();
    }

    return <ProblemEditor initialProblem={problem} />;
}
