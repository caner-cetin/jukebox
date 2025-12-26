await Bun.build({
  entrypoints: ["./src/main.ts"],
  outdir: "./dist",
  minify: true,
  target: "browser",
  format: "esm",
});