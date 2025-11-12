import * as vscode from 'vscode';
import * as WebSocket from 'ws';
import { Buffer } from 'buffer';
import { MCP_METHODS, MCP_NOTIFICATIONS } from 'types';
import type { JsonRpcRequest } from 'types';
import { GeminiService } from './services/geminiService';
import { PlanExecutor } from './planExecutor';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class McpServer {
    private wss: WebSocket.Server | null = null;
    private readonly port = parseInt(process.env.WS_PORT || '3030');
    private geminiService: GeminiService;
    private planExecutor: PlanExecutor;
    private masterPasswordCache: string | null = null;

    constructor(private context: vscode.ExtensionContext) {
        this.geminiService = new GeminiService();
        this.planExecutor = new PlanExecutor(this.geminiService);
    }

    public start() {
        if (this.wss) {
            console.log('MCP Server already running');
            return;
        }

        this.wss = new WebSocket.Server({ port: this.port });
        console.log(`🌐 Morphlex AI MCP Server listening on ws://localhost:${this.port}`);

        this.wss.on('connection', (ws: WebSocket) => {
            console.log('🔗 Brain connected');

            this.planExecutor.setNotifier((method, params) => {
                this.notify(ws, method, params);
            });

            ws.on('message', async (message: string) => {
                try {
                    const request: JsonRpcRequest = JSON.parse(message);
                    await this.handleRequest(request, ws);
                } catch (error) {
                    console.error('❌ Failed to handle message:', error);
                    this.notify(ws, MCP_NOTIFICATIONS.error, { message: 'Invalid message format' });
                }
            });

            ws.on('close', () => {
                console.log('🔌 Brain disconnected');
            });
        });
    }

    private async handleRequest(request: JsonRpcRequest, ws: WebSocket) {
        switch (request.method) {
            case MCP_METHODS.findComponent:
                await this.handleFindComponent(request.params, ws);
                break;
            case MCP_METHODS.generatePlan:
                await this.handleGeneratePlan(request.params, ws);
                break;
            case MCP_METHODS.storeSecret:
                await this.handleStoreSecret(request.params, ws);
                break;
            default:
                console.warn(`⚠️  Unknown method: ${request.method}`);
                this.notify(ws, MCP_NOTIFICATIONS.error, { message: `Unknown method: ${request.method}` });
        }
    }

    private async handleFindComponent(params: { imageBase64: string }, ws: WebSocket) {
        try {
            this.notify(ws, MCP_NOTIFICATIONS.log, { level: 'info', message: 'Searching workspace for matching component...' });

            const files = await vscode.workspace.findFiles('**/*.{jsx,tsx,vue,js,ts}', '**/node_modules/**');
            const fileContents = await Promise.all(
                files.slice(0, 20).map(async (file) => {
                    const document = await vscode.workspace.openTextDocument(file);
                    return {
                        filePath: file.fsPath,
                        fileContent: document.getText(),
                    };
                })
            );

            const filePath = await this.geminiService.findComponent(params.imageBase64, fileContents);
            this.notify(ws, MCP_NOTIFICATIONS.filePathFound, { filePath });
        } catch (error) {
            console.error('❌ Error finding component:', error);
            this.notify(ws, MCP_NOTIFICATIONS.error, { message: `Error finding component: ${(error as Error).message}` });
        }
    }

    private async handleGeneratePlan(params: { goal: string; filePath: string }, ws: WebSocket) {
        try {
            this.notify(ws, MCP_NOTIFICATIONS.log, { level: 'info', message: 'Reading target file...' });

            const uri = vscode.Uri.file(params.filePath);
            const fileContentBytes = await vscode.workspace.fs.readFile(uri);
            const fileContent = Buffer.from(fileContentBytes).toString('utf-8');

            this.notify(ws, MCP_NOTIFICATIONS.log, { level: 'info', message: 'Generating execution plan with Gemini...' });
            const plan = await this.geminiService.generatePlan(fileContent, params.goal);
            this.notify(ws, MCP_NOTIFICATIONS.planGenerated, { plan });

            this.notify(ws, MCP_NOTIFICATIONS.log, { level: 'info', message: 'Executing plan...' });
            await this.planExecutor.executePlan(plan, params.filePath);

        } catch (error) {
            console.error('❌ Error generating/executing plan:', error);
            this.notify(ws, MCP_NOTIFICATIONS.error, { message: `Error: ${(error as Error).message}` });
        }
    }

    private async handleStoreSecret(params: { key: string; value: string }, ws: WebSocket) {
        try {
            await execAsync('ferri --version');
        } catch (error) {
            this.notify(ws, MCP_NOTIFICATIONS.error, {
                message: '`ferri` CLI not found. Please install it and ensure it is in your PATH.'
            });
            return;
        }

        if (!this.masterPasswordCache) {
            const password = await vscode.window.showInputBox({
                prompt: 'Enter your ferri master password',
                password: true,
                ignoreFocusOut: true,
            });
            if (!password) {
                this.notify(ws, MCP_NOTIFICATIONS.error, { message: 'Password entry was cancelled.' });
                return;
            }
            this.masterPasswordCache = password;
        }

        const child = spawn('ferri', ['set', params.key, params.value]);
        let stderr = '';
        child.stderr.on('data', (data) => { stderr += data; });

        child.on('close', (code) => {
            if (code === 0) {
                this.notify(ws, MCP_NOTIFICATIONS.secretStored, {
                    message: `Secret '${params.key}' stored successfully.`
                });
            } else {
                this.notify(ws, MCP_NOTIFICATIONS.error, {
                    message: `Failed to store secret: ${stderr}`
                });
                this.masterPasswordCache = null;
            }
        });

        child.stdin.write(this.masterPasswordCache + '\n');
        child.stdin.end();
    }

    private notify(ws: WebSocket, method: string, params: any) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method, params }));
        }
    }

    public stop() {
        if (this.wss) {
            this.wss.close();
            this.wss = null;
            console.log('🛑 MCP Server stopped');
        }
    }
}
