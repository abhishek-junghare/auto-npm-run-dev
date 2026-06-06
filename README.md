# npm run dev Auto-Runner

Automatically run `npm run dev` in your workspace folders when you open them. No need to manually create task files anymore. Works seamlessly across macOS, Windows, and Linux.

## Options

### 1. Add a folder

#### Method 1: The Automatic Prompt

The extension will ask you the first time you open a folder. Click `Yes` to opt-in.

After clicking `Yes`, a second prompt will ask you to select the local development URL for that folder. You can choose `http://localhost:3000` or select `Custom` to enter your own URL (e.g. `http://localhost:5173`).

The folder will then run `npm run dev` automatically every time you open it.

You can also click:

- `No` - to permanently ignore the folder (it will never be asked again).
- `Ask Later` - to skip just this time, and be asked again next time.

#### Method 2: Extension Settings

1. Open VS Code Settings.
2. Search for `autoRunDev.allowedFolders`.
3. Add an entry as an object with `path` and `url` fields:

```json
// Windows
{
    "path": "d:\\projects\\my-app",
    "url": "http://localhost:3000"
}

// macOS/Linux
{
    "path": "/users/yourname/projects/my-app",
    "url": "http://localhost:3000"
}
```

### 2. Remove a folder

1. Open VS Code Settings.
2. Search for `autoRunDev.allowedFolders`.
3. Remove the folder's entry from the list.

### 3. Open browser automatically

By default, the extension opens your default browser to the folder's configured URL when `npm run dev` starts. To disable this:

1. Open VS Code Settings.
2. Search for `autoRunDev.openBrowser`.
3. Uncheck the box to disable it.

### 4. Show terminal on command run

By default, the terminal runs in the background. To make the terminal panel appear automatically when the script starts:

1. Open VS Code Settings.
2. Search for `autoRunDev.showTerminalOnStart`.
3. Check the box to enable it.