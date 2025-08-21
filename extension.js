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

  context.subscriptions.push(documentLinkProvider);
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

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
