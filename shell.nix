{pkgs ? import <nixpkgs> {}}:
with pkgs;
  mkShell {
    name = "jukebox";
    description = "The BEST JUKEBOX EVER";

    packages = [
      bun
      biome
    ];
  }
