import { build } from "esbuild";

import rimraf = require("rimraf");
const cssModulesPlugin = require("esbuild-css-modules-plugin");

/**
 * Common options passed during build .
 */
interface BuildOptions {
  env: "production" | "development";
}

export async function cleanup() {
  await rimraf("../build/", (err) => console.log(err));
}

/**
 * app A builder function of the package .
 */
export async function buildApp(options: BuildOptions) {
  const { env } = options;
  await build({
    entryPoints: ["packages/client/src/index.tsx"], // We read from this entry point React Applications
    outfile: "build/public/script.js", // We are public/ Output a file in the folder （ please remember , stay HTML The page uses "script.js"）
    define: {
      "process.env.NODE_ENV": `"${env}"`, // We need to define the Node.js Environmental Science
    },
    loader: {
      ".png": "dataurl",
      ".svg": "text",
    },
    plugins: [cssModulesPlugin()],
    bundle: true,
    minify: env === "production",
    sourcemap: env === "development",
  });
  // await copyfiles(['./packages/client/public/*', './build/public'], {up: true},(err) => console.log(err))
}
/**
 * server The builder function of the software package .
 */
export async function buildServer(options: BuildOptions) {
  const { env } = options;
  await build({
    entryPoints: ["packages/server/src/index.ts"],
    outfile: "build/index.js",
    define: {
      "process.env.NODE_ENV": `"${env}"`,
    },
    // external: ['express'], // Some libraries must be marked as external libraries
    platform: "node", // by Node Build time , We need to set the environment for it
    target: "node14.15.5",
    bundle: true,
    minify: env === "production",
    sourcemap: env === "development",
  });
}
/**
 * The builder function of all packages .
 */
async function buildAll() {
  await cleanup();
  await Promise.all([
    buildServer({
      env: "production",
    }),
  ]);
}
// When we use from the terminal ts-node When running scripts , This method will be executed
buildAll();
