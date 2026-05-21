# npm run dev Auto-Runner

Automatically run `npm run dev` in your workspace folders when you open them. No need to manually create tasks files anymore. Works seamlessly across macOS, Windows, and Linux.

## Options

### 1. Add folder

#### Method 1: The Automatic Prompt

The extension will ask you the first time you open a folder. Simply click **`Yes`** to opt-in, and it will run automatically from then on. You can also click **`Don't Ask Again`** to permanently ignore the folder.

#### Method 2: Extension Settings

1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`).
2. Search for `autoRunDev.allowedFolders`.
3. Add your folder's absolute path to the list.

### 2. Remove folder

1. Open VS Code Settings.
2. Search for `autoRunDev.allowedFolders`.
3. Remove the folder's path from the list.

### 3. Show terminal on command run

By default, the terminal runs in the background. If you want the terminal panel to automatically show when the script starts:

1. Open VS Code Settings.
2. Search for `autoRunDev.showTerminalOnStart`.
3. Check the box to enable it.
