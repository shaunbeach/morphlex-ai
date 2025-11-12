import { GoogleGenerativeAI } from '@google/generative-ai';
import type { PlanStep } from 'types';
import { PlanStepStatus } from 'types';

export class GeminiService {
    private ai: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY environment variable not set for Gemini.");
        }
        this.ai = new GoogleGenerativeAI(apiKey);
    }

    async findComponent(imageBase64: string, files: { filePath: string; fileContent: string }[]): Promise<string> {
        const model = this.ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const imagePart = {
            inlineData: {
                mimeType: 'image/png',
                data: imageBase64,
            },
        };

        const prompt = `
            You are an expert code analysis tool. I will provide you with a screenshot of a UI component and a list of source code files.
            Your task is to identify which source file most closely matches the provided screenshot.
            Analyze both the structure and content.
            Return ONLY the full file path of the best match. Do not provide any other text, explanation, or markdown formatting.

            Files:
            ${files.map(f => `--- FILE: ${f.filePath} ---\n${f.fileContent}`).join('\n\n')}
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text().trim();
    }

    async generatePlan(fileContent: string, goal: string): Promise<PlanStep[]> {
        const model = this.ai.getGenerativeModel({
            model: 'gemini-2.5-pro',
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "array" as const,
                    items: {
                        type: "object" as const,
                        properties: {
                            step: { type: "string" as const },
                            tool: { type: "string" as const },
                            params: {
                                type: "array" as const,
                                items: { type: "string" as const }
                            }
                        },
                        required: ["step", "tool", "params"]
                    }
                }
            }
        });

        const prompt = `
            You are a senior software engineer creating a refactoring plan.
            Analyze the provided code and the user's goal.
            Generate a step-by-step plan as a JSON array. Each step must have a "step" description, a "tool" ('git', 'npm', 'jscodeshift', 'test', 'fs'), and "params" (an array of strings for the command).

            - Use 'jscodeshift' for code transformations. The 'params' should be ['-t', '<CODEMOD_PLACEHOLDER>', '<TARGET_FILE_PLACEHOLDER>'].
            - Use 'npm' for dependency management (e.g., install, uninstall).
            - Use 'git' for version control (e.g., creating a branch).
            - Use 'test' to run verification scripts (e.g., 'npm', 'run', 'test').

            Context:
            \`\`\`
            ${fileContent}
            \`\`\`

            Goal: ${goal}

            Return only the JSON array.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const plan = JSON.parse(response.text().trim());

        return plan.map((p: any) => ({ ...p, status: PlanStepStatus.Pending }));
    }

    async generateCodemod(fileContent: string, planGoal: string): Promise<string> {
        const model = this.ai.getGenerativeModel({ model: 'gemini-2.5-pro' });

        const prompt = `You are a jscodeshift expert. Transform this code:

${fileContent}

to achieve this goal: "${planGoal}".

Return *only* the raw JavaScript for the codemod. Do not include markdown fences or any explanations.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }

    async generateCorrectedCodemod(originalCode: string, failedCodemod: string, testError: string): Promise<string> {
        const model = this.ai.getGenerativeModel({ model: 'gemini-2.5-pro' });

        const prompt = `
            You are a world-class debugging engineer specializing in jscodeshift codemods.
            The following codemod script failed to correctly refactor the original code.

            **Original Code:**
            \`\`\`javascript
            ${originalCode}
            \`\`\`

            **Failed Codemod Script:**
            \`\`\`javascript
            ${failedCodemod}
            \`\`\`

            **Test Error:**
            \`\`\`
            ${testError}
            \`\`\`

            Analyze the original code, the failed codemod, and the test error.
            Generate a new, corrected codemod script that fixes the issue and successfully performs the refactoring.

            Return *only* the raw, corrected JavaScript code for the new codemod. Do not include any explanations or markdown.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    }
}
