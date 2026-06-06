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

    let lowerBlockedFolders = blockedFolders.map((p) => p.toLowerCase());

    // 1. Check if explicitly allowed
    const matchingAllowed = allowedFolders.find((f) => f && f.path && f.path.toLowerCase() === folderPath);
    if (matchingAllowed) {
        executeDevCommand(folder, matchingAllowed.url || "http://localhost:3000");
        return;
    }

    // 2. If permanently blocked, silently skip
    if (lowerBlockedFolders.includes(folderPath)) {
        return;
    }

    // 3. Prompt the user
    const selection = await vscode.window.showInformationMessage(`Would you like to run 'npm run dev' automatically for '${folder.name}'?`, "Yes", "No", "Ask Later");

    if (selection === "Yes") {
        // Step 4. Second toast notification right in the bottom corner
        const portSelection = await vscode.window.showInformationMessage(`Select the local development port for '${folder.name}':`, "http://localhost:3000", "Custom");

        let finalUrl = "http://localhost:3000";

        if (portSelection === "http://localhost:3000") {
            finalUrl = "http://localhost:3000";
        } else if (portSelection === "Custom") {
            // Only show top input box if they explicitly ask for a custom port
            const userUrl = await vscode.window.showInputBox({
                prompt: "Enter the custom local development URL",
                value: "http://localhost:",
                placeHolder: "e.g. http://localhost:5173",
            });
            if (userUrl !== undefined) {
                finalUrl = userUrl;
            }
        } else {
            // User closed the port notification toast without selecting anything
            console.log(`No port selected for ${folder.name}, defaulting to 3000.`);
        }

        // Save selection permanently
        allowedFolders.push({ path: folderPath, url: finalUrl });
        await config.update("allowedFolders", allowedFolders, vscode.ConfigurationTarget.Global);

        executeDevCommand(folder, finalUrl);
    } else if (selection === "Ask Later") {
        console.log(`Skipped running dev for ${folder.name} this time.`);
    } else if (selection === "No") {
        blockedFolders.push(folderPath);
        await config.update("blockedFolders", blockedFolders, vscode.ConfigurationTarget.Global);
    }
}

/**
 * Spawns the terminal, cleaning up any stale terminal with the same name first
 * @param {vscode.WorkspaceFolder} folder
 * @param {string} browserUrl
 */
async function executeDevCommand(folder, browserUrl) {
    const config = vscode.workspace.getConfiguration("autoRunDev");
    const showTerminal = config.get("showTerminalOnStart", false);
    const openBrowserSetting = config.get("openBrowser", false);
    const terminalName = `Auto Dev Server (${folder.name})`;

    // Find if a terminal with this specific name already exists
    const existingTerminals = vscode.window.terminals.filter((t) => t.name === terminalName);
    existingTerminals.forEach((t) => t.dispose());

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Force CMD on Windows to bypass PowerShell execution policies
    const terminalOptions = {
        name: terminalName,
        cwd: folder.uri.fsPath,
    };
    if (process.platform === "win32") {
        terminalOptions.shellPath = "cmd.exe";
    }

    // Create the fresh terminal session
    const terminal = vscode.window.createTerminal(terminalOptions);

    // Only bring up the terminal panel if the setting is true
    if (showTerminal) {
        terminal.show();
    }

    terminal.sendText("npm run dev", true);

    // Run browser open command independently using the folder-specific URL
    if (openBrowserSetting) {
        openBrowserInTerminal(folder, browserUrl);
    }
}

/**
 * Opens the browser by executing a platform-specific start command in a separate, temporary terminal
 * @param {vscode.WorkspaceFolder} folder
 * @param {string} url
 */
function openBrowserInTerminal(folder, url) {
    const browserTerminalName = `Auto Open Browser (${folder.name})`;

    // Clean up older browser trigger terminal if it exists
    const existingBrowserTerminals = vscode.window.terminals.filter((t) => t.name === browserTerminalName);
    existingBrowserTerminals.forEach((t) => t.dispose());

    // Fix: Force CMD on Windows here as well
    const browserTerminalOptions = {
        name: browserTerminalName,
        cwd: folder.uri.fsPath,
    };
    if (process.platform === "win32") {
        browserTerminalOptions.shellPath = "cmd.exe";
    }

    const browserTerminal = vscode.window.createTerminal(browserTerminalOptions);

    // Determine OS-specific command using the dynamic URL config
    let openCommand;
    switch (process.platform) {
        case "win32":
            openCommand = `start ${url}`;
            break;
        case "darwin": // macOS
            openCommand = `open ${url}`;
            break;
        default: // Linux
            openCommand = `xdg-open ${url}`;
            break;
    }

    // Execute the command
    browserTerminal.sendText(openCommand, true);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
