const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("BangumiPlan extension is now active!");

  // 注册文档链接提供器
  const linkProvider = new BgmLinkProvider();
  const documentLinkProvider = vscode.languages.registerDocumentLinkProvider(
    { language: "bangumiplan" },
    linkProvider
  );

  // 注册悬浮提示提供器
  const hoverProvider = new WatchCountHoverProvider();
  const hoverProviderRegistration = vscode.languages.registerHoverProvider(
    { language: "bangumiplan" },
    hoverProvider
  );

  context.subscriptions.push(documentLinkProvider, hoverProviderRegistration);
}

class BgmLinkProvider {
  provideDocumentLinks(document, token) {
    const links = [];
    const text = document.getText();

    // 匹配 [数字] 格式的 BGM ID
    const bgmIdRegex = /\[(\d+)\]/g;
    let match;

    while ((match = bgmIdRegex.exec(text)) !== null) {
      const bgmId = match[1];
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);

      // 创建到 BGM 网站的链接
      const uri = vscode.Uri.parse(`https://bgm.tv/subject/${bgmId}`);
      const link = new vscode.DocumentLink(range, uri);
      link.tooltip = `跳转到 BGM: ${bgmId}`;

      links.push(link);
    }

    return links;
  }
}

class WatchCountHoverProvider {
  provideHover(document, position, token) {
    try {
      const line = document.lineAt(position);
      const lineText = line.text;

      // 匹配包含√符号的行
      const watchMarksRegex = /(√+)/g;
      let match;

      while ((match = watchMarksRegex.exec(lineText)) !== null) {
        const watchMarks = match[1];
        const startPos = new vscode.Position(position.line, match.index);
        const endPos = new vscode.Position(
          position.line,
          match.index + watchMarks.length
        );
        const range = new vscode.Range(startPos, endPos);

        // 检查鼠标位置是否在√符号范围内
        if (range.contains(position)) {
          const count = watchMarks.length;
          const hoverText = new vscode.MarkdownString();
          hoverText.appendMarkdown(`**观看进度**\n\n`);
          hoverText.appendMarkdown(`已观看: **${count}** 集\n\n`);
          hoverText.appendMarkdown(`进度标记: \`${watchMarks}\``);

          return new vscode.Hover(hoverText, range);
        }
      }

      // 如果鼠标悬浮在条目标题上，也显示观看进度
      const entryRegex = /^(\s{8})(\[(\d+)\])?(.+?)( √+)?\s*$/;
      const entryMatch = lineText.match(entryRegex);

      if (entryMatch) {
        const indent = entryMatch[1] || "";
        const bgmIdMatch = entryMatch[2] || "";
        const bgmId = entryMatch[3];
        const title = entryMatch[4]?.trim();
        const watchMarks = entryMatch[5];

        // 计算标题的位置范围
        const titleStart = indent.length + bgmIdMatch.length;
        const titleEnd = titleStart + (title ? title.length : 0);

        // 检查鼠标是否在标题范围内
        if (
          position.character >= titleStart &&
          position.character <= titleEnd &&
          title
        ) {
          const hoverText = new vscode.MarkdownString();
          hoverText.appendMarkdown(`**${title}**\n\n`);

          if (bgmId) {
            hoverText.appendMarkdown(
              `BGM ID: [${bgmId}](https://bgm.tv/subject/${bgmId})\n\n`
            );
          }

          if (watchMarks) {
            const count = watchMarks.trim().length;
            hoverText.appendMarkdown(`观看进度: **${count}** 集\n\n`);
            hoverText.appendMarkdown(`进度标记: \`${watchMarks.trim()}\``);
          } else {
            hoverText.appendMarkdown(`观看进度: **未开始**`);
          }

          const range = new vscode.Range(
            new vscode.Position(position.line, titleStart),
            new vscode.Position(position.line, titleEnd)
          );

          return new vscode.Hover(hoverText, range);
        }
      }

      return null;
    } catch (error) {
      console.error("BangumiPlan hover provider error:", error);
      return null;
    }
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
