await Bun.build({
	entrypoints: ["./src/main.ts"],
	outdir: "./dist",
	minify: false,
	target: "browser",
	format: "esm",
});
