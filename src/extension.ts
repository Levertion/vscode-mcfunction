"use strict";
import * as path from "path";
import { ExtensionContext, window } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient";

export function activate(context: ExtensionContext) {
  // The main file for the server
  const serverModule = path.join(__dirname, "..", "server", "out", "index.js");
  // The debug options for the server. Uses a port in about the Minecraft range
  const debugOptions = { execArgv: ["--nolazy", "--inspect-brk=25575"] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    debug: {
      module: serverModule,
      options: debugOptions,
      transport: TransportKind.ipc
    },
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
      // Client startup failed. Possibly impossible?
    });

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(disposable);
}
