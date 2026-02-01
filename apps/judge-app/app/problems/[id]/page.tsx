import SubmissionForm from "@/app/components/SubmissionForm";
import { api } from "@/app/lib/api";
import styles from "./ProblemPage.module.css";
import SampleCases from "./SampleCases";
import ProblemHeader from "./ProblemHeader";
import ProblemStatementHeader from "./ProblemStatementHeader";
import ProblemStatement from "./ProblemStatement";

export default async function ProblemPage({ params }: Readonly<{
    params: Promise<{
        id: string;
    }>
}>) {
    const problem = await api.getProblem((await params).id);
    const samples = await api.getSamples(problem.id);

    return (
        <main className={styles.container}>
            <ProblemHeader
                title={problem.title}
                timeLimitMs={problem.timeLimitMs}
                memoryLimitMb={problem.memoryLimitMb}
                difficulty={problem.difficulty}
            />

            <section className={styles.statement}>
                <ProblemStatementHeader />
                <ProblemStatement statement={problem.statement} />

                {samples.length > 0 && (
                    <SampleCases samples={samples} />
                )}
            </section>

            <SubmissionForm problemId={problem.id} />
        </main>
    );
}
