module.exports = {
    branches: ["main"],
    plugins: [
      "@semantic-release/commit-analyzer", // Commit mesajlarını analiz eder.
      "@semantic-release/release-notes-generator", // Release notları oluşturur.
      "@semantic-release/changelog", // Changelog dosyasını günceller.
      "@semantic-release/npm", // NPM paketi olarak yayın yapar (isteğe bağlı).
      [
        "@semantic-release/git",
        {
          assets: ["CHANGELOG.md", "package.json", "package-lock.json"],
          message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
        },
      ],
    ],
  };
  