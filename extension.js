const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log("Auto Run Dev extension is now active.");

    if (vscode.workspace.workspaceFolders) {
        vscode.workspace.workspaceFolders.forEach((folder) => {
            checkAndRunDev(folder);
        });
    }

    let workspaceListener = vscode.workspace.onDidChangeWorkspaceFolders((event) => {
        event.added.forEach((folder) => {
            checkAndRunDev(folder);
        });
    });

    context.subscriptions.push(workspaceListener);
}

/**
 * Checks settings and prompts the user to run the dev script
 * @param {vscode.WorkspaceFolder} folder
 */
async function checkAndRunDev(folder) {
    const folderPath = folder.uri.fsPath.toLowerCase();

    const config = vscode.workspace.getConfiguration("autoRunDev");
    let allowedFolders = config.get("allowedFolders", []);
    let blockedFolders = config.get("blockedFolders", []);

    let lowerAllowedFolders = allowedFolders.map((p) => p.toLowerCase());
    let lowerBlockedFolders = blockedFolders.map((p) => p.toLowerCase());

    // 1. If explicitly allowed, run it immediately
    if (lowerAllowedFolders.includes(folderPath)) {
        executeDevCommand(folder);
        return;
    }

    // 2. If permanently blocked, silently skip and don't prompt
    if (lowerBlockedFolders.includes(folderPath)) {
        return;
    }

    // 3. Prompt the user
    const selection = await vscode.window.showInformationMessage(`Would you like to run 'npm run dev' automatically for the current folder?`, "Yes", "No", "Don't Ask Again");

    if (selection === "Yes") {
        allowedFolders.push(folderPath);
        await config.update("allowedFolders", allowedFolders, vscode.ConfigurationTarget.Global);
        executeDevCommand(folder);
    } else if (selection === "No") {
        console.log(`Skipped running dev for ${folder.name} this time.`);
    } else if (selection === "Don't Ask Again") {
        blockedFolders.push(folderPath);
        await config.update("blockedFolders", blockedFolders, vscode.ConfigurationTarget.Global);
    }
}

/**
 * Spawns the terminal, cleaning up any stale terminal with the same name first
 * @param {vscode.WorkspaceFolder} folder
 */
async function executeDevCommand(folder) {
    const config = vscode.workspace.getConfiguration("autoRunDev");
    const showTerminal = config.get("showTerminalOnStart", false);
    const terminalName = `Auto Dev Server (${folder.name})`;

    // Find if a terminal with this specific name already exists
    const existingTerminals = vscode.window.terminals.filter((t) => t.name === terminalName);
    existingTerminals.forEach((t) => t.dispose());

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Create the fresh terminal session
    const terminal = vscode.window.createTerminal({
        name: terminalName,
        cwd: folder.uri.fsPath,
    });

    // Only bring up the terminal panel if the setting is true
    if (showTerminal) {
        terminal.show();
    }

    terminal.sendText("npm run dev", true);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
