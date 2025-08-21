请把扩展的图标放在此目录，并命名为 `icon.png`。

推荐规范：

- 主图标：`icon.png`（PNG，非 SVG），至少 128x128 像素；建议使用 256x256 或 512x512 保证在高 DPI 下清晰。
- Marketplace 横幅（可选）：`gallery-banner.png`（PNG，建议 400x120 或按 Marketplace 要求调整），可以在 `package.json` 中使用 `galleryBanner` 字段配置 `color` 与 `theme`。

注意：

- `vsce` 不允许发布包含用户提供的 SVG 图像，图标必须是 PNG 等位图格式。
- 将实际图像文件加入仓库并确保 `.vscodeignore` 没有把它们排除。

如何验证：

1. 把 `images/icon.png` 放入仓库。
2. 在项目根目录运行 `vsce package`，生成 `.vsix` 后使用 `code --install-extension <your>.vsix` 本地安装，查看扩展侧边栏图标显示。
3. 使用 `vsce publish` 发布后在 Marketplace 页面查看图标显示。

如果你需要，我可以帮你生成一份简单的 512x512 占位图标（PNG）。
