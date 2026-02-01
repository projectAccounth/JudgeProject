// Export all schemas
export { EchoSchema, type EchoRequest, type EchoResponse } 
    from "./echo.schema.js";
export {
    SubmissionCreateSchema,
    type SubmissionCreateRequest
} from "./submission.schema.js";
export {
    TestcaseSchema,
    FullTestcaseSchema,
    TestcaseDataSchema,
    TestcaseOverrideSchema,
    ProblemSchema,
    ProblemGetSchema,
    ProblemTestcaseCreateSchema,
    type Testcase,
    type FullTestcase,
    type Problem,
    type ProblemGet,
    type ProblemTestcaseCreate
} from "./problem.schema.js";
