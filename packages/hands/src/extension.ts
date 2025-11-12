import * as vscode from 'vscode';
import { McpServer } from './mcpServer';
import * as dotenv from 'dotenv';
import * as path from 'path';

let mcpServer: McpServer;

export function activate(context: vscode.ExtensionContext) {
    // Load .env file from the extension's root directory
    const envPath = path.join(context.extensionPath, '.env');
    dotenv.config({ path: envPath });

    console.log('🚀 Morphlex AI Hands extension is now active!');

    try {
        mcpServer = new McpServer(context);
        mcpServer.start();

        vscode.window.showInformationMessage('✅ Morphlex AI: Execution Mode enabled');
    } catch (error) {
        vscode.window.showErrorMessage(`❌ Failed to activate Morphlex AI: ${(error as Error).message}`);
    }

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('morphlex.startServer', () => {
            try {
                mcpServer.start();
                vscode.window.showInformationMessage('Morphlex AI: Server started');
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to start server: ${(error as Error).message}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('morphlex.stopServer', () => {
            mcpServer.stop();
            vscode.window.showInformationMessage('Morphlex AI: Server stopped');
        })
    );
}

export function deactivate() {
    if (mcpServer) {
        mcpServer.stop();
    }
}
