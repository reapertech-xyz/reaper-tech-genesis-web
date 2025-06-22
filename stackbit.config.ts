// stackbit.config.ts
import { defineStackbitConfig } from "@stackbit/types";
import { GitContentSource } from "@stackbit/cms-git";

export default defineStackbitConfig({
stackbitVersion: "~0.5.0",
  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ["content"],
      models: [
        {
          name: "Page",
          // Define the model as a page model
          type: "page",
          urlPath: "/{slug}",
          filePath: "content/pages/{slug}.json",
            fields: [
              { name: "title", type: "string", required: true },
              { name: "headerTitle", type: "string" },
              {
                name: "shop",
                type: "object",
                fields: [
                  { name: "title", type: "string" },
                  { name: "description", type: "text" }
                ]
              },
              {
                name: "web3",
                type: "object",
                fields: [
                  { name: "cta", type: "string" }
                ]
              }
            ]
