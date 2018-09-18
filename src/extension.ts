"use strict";
import { join } from "path";
import { ExtensionContext, window } from "vscode";
import {
  ForkOptions,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient";

export function activate(context: ExtensionContext) {
  // The main file for the server
  const serverModule = require.resolve("mcfunction-langserver");
  // The debug options for the server. Uses a port in about the Minecraft range
  const debugOptions: ForkOptions = {
    execArgv: ["--nolazy", "--inspect-brk=25575"]
  };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    debug: {
      module: serverModule,
      options: debugOptions,
      transport: TransportKind.ipc
    },
    options: { cwd: join(__dirname, "..") },
    run: { module: serverModule, transport: TransportKind.ipc }
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: "mcfunction" },
      { scheme: "untitled", language: "mcfunction" }
    ],
    synchronize: { configurationSection: "mcfunction" }
  };

  const client = new LanguageClient(
    "mcfunction",
    "Minecraft Function",
    serverOptions,
    clientOptions
  );

  const disposable = client.start();
  client
    .onReady()
    .then(() => {
      client.onNotification("mcfunction/shutdown", (reason: string) => {
        window.showWarningMessage(
          `Minecraft function loader requested to be shutdown with reason ${reason}`
        );
        client.stop();
        disposable.dispose();
      });
    })
    .catch(() => {
      // Client startup failed. This might happen because the ipc connection failed
    });

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(disposable);
}
