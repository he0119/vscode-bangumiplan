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
      link.tooltip = `跳转到 BGM ID: ${bgmId}`;

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
      // 支持多种格式：
      // 1. [ID]标题<日期>(说明)
      // 2. [ID]标题<日期>
      // 3. 标题<日期>(说明)
      // 4. 标题<日期>
      // 5. [ID]标题 √√√(说明)
      // 6. [ID]标题 √√√
      // 7. [ID]标题
      const entryWithDateNoteRegex =
        /^(\s{8})(\[(\d+)\])(.+?)(<[^>]+>)(\([^)]+\))\s*$/;
      const entryWithDateRegex = /^(\s{8})(\[(\d+)\])(.+?)(<[^>]+>)\s*$/;
      const entryNoIdWithDateNoteRegex =
        /^(\s{8})(.+?)(<[^>]+>)(\([^)]+\))\s*$/;
      const entryNoIdWithDateRegex = /^(\s{8})(.+?)(<[^>]+>)\s*$/;
      const entryWithWatchMarksAndNoteRegex =
        /^(\s{8})(\[(\d+)\])?(.+?)( √+)(\([^)]+\))\s*$/;
      const entryWithWatchMarksRegex = /^(\s{8})(\[(\d+)\])?(.+?)( √+)\s*$/;
      const entryBasicRegex = /^(\s{8})(\[(\d+)\])?(.+?)\s*$/;

      let entryMatch = null;
      let formatType = "";
      let bgmId = null;
      let title = "";
      let completionDate = "";
      let noteText = "";
      let watchMarks = "";

      // 按优先级匹配不同格式
      if ((entryMatch = lineText.match(entryWithDateNoteRegex))) {
        formatType = "dateNote";
        bgmId = entryMatch[3];
        title = entryMatch[4]?.trim();
        completionDate = entryMatch[5];
        noteText = entryMatch[6];
      } else if ((entryMatch = lineText.match(entryWithDateRegex))) {
        formatType = "date";
        bgmId = entryMatch[3];
        title = entryMatch[4]?.trim();
        completionDate = entryMatch[5];
      } else if ((entryMatch = lineText.match(entryNoIdWithDateNoteRegex))) {
        formatType = "noIdDateNote";
        bgmId = null;
        title = entryMatch[2]?.trim();
        completionDate = entryMatch[3];
        noteText = entryMatch[4];
      } else if ((entryMatch = lineText.match(entryNoIdWithDateRegex))) {
        formatType = "noIdDate";
        bgmId = null;
        title = entryMatch[2]?.trim();
        completionDate = entryMatch[3];
      } else if (
        (entryMatch = lineText.match(entryWithWatchMarksAndNoteRegex))
      ) {
        formatType = "watchMarksNote";
        bgmId = entryMatch[3];
        title = entryMatch[4]?.trim();
        watchMarks = entryMatch[5];
        noteText = entryMatch[6];
      } else if ((entryMatch = lineText.match(entryWithWatchMarksRegex))) {
        formatType = "watchMarks";
        bgmId = entryMatch[3];
        title = entryMatch[4]?.trim();
        watchMarks = entryMatch[5];
      } else if ((entryMatch = lineText.match(entryBasicRegex))) {
        formatType = "basic";
        bgmId = entryMatch[3];
        title = entryMatch[4]?.trim();
      }

      if (entryMatch && title) {
        const indent = entryMatch[1] || "";
        let bgmIdMatch = "";
        let titleStart = indent.length;

        // 根据不同格式计算位置
        if (formatType === "dateNote" || formatType === "date") {
          bgmIdMatch = entryMatch[2] || "";
          titleStart = indent.length + bgmIdMatch.length;
        } else if (formatType === "noIdDateNote" || formatType === "noIdDate") {
          // 没有BGM ID的格式
          titleStart = indent.length;
        } else if (
          formatType === "watchMarksNote" ||
          formatType === "watchMarks" ||
          formatType === "basic"
        ) {
          bgmIdMatch = entryMatch[2] || "";
          titleStart = indent.length + bgmIdMatch.length;
        }

        const titleEnd = titleStart + title.length;

        // 检查鼠标是否在标题范围内
        if (
          position.character >= titleStart &&
          position.character <= titleEnd
        ) {
          const hoverText = new vscode.MarkdownString();
          hoverText.appendMarkdown(`**${title}**\n\n`);

          if (bgmId) {
            hoverText.appendMarkdown(
              `BGM ID: [${bgmId}](https://bgm.tv/subject/${bgmId})\n\n`
            );
          }

          // 根据格式类型显示不同信息
          if (formatType === "dateNote" || formatType === "noIdDateNote") {
            const cleanDate = completionDate.replace(/[<>]/g, "");
            const cleanNote = noteText.replace(/[()]/g, "");
            hoverText.appendMarkdown(`完成日期: **${cleanDate}**\n\n`);
            hoverText.appendMarkdown(`说明: *${cleanNote}*`);
          } else if (formatType === "date" || formatType === "noIdDate") {
            const cleanDate = completionDate.replace(/[<>]/g, "");
            hoverText.appendMarkdown(`完成日期: **${cleanDate}**`);
          } else if (formatType === "watchMarksNote") {
            const count = watchMarks.trim().length;
            const cleanNote = noteText.replace(/[()]/g, "");
            hoverText.appendMarkdown(`观看进度: **${count}** 集\n\n`);
            hoverText.appendMarkdown(`进度标记: \`${watchMarks.trim()}\`\n\n`);
            hoverText.appendMarkdown(`说明: *${cleanNote}*`);
          } else if (formatType === "watchMarks") {
            const count = watchMarks.trim().length;
            hoverText.appendMarkdown(`观看进度: **${count}** 集\n\n`);
            hoverText.appendMarkdown(`进度标记: \`${watchMarks.trim()}\``);
          }

          const range = new vscode.Range(
            new vscode.Position(position.line, titleStart),
            new vscode.Position(position.line, titleEnd)
          );

          return new vscode.Hover(hoverText, range);
        }

        // 检查鼠标是否悬浮在完成日期上
        if (
          (formatType === "dateNote" ||
            formatType === "date" ||
            formatType === "noIdDateNote" ||
            formatType === "noIdDate") &&
          completionDate
        ) {
          const dateStart = titleStart + title.length;
          const dateEnd = dateStart + completionDate.length;

          if (
            position.character >= dateStart &&
            position.character <= dateEnd
          ) {
            const cleanDate = completionDate.replace(/[<>]/g, "");
            const hoverText = new vscode.MarkdownString();
            hoverText.appendMarkdown(`**完成日期**\n\n`);
            hoverText.appendMarkdown(`日期: **${cleanDate}**\n\n`);
            hoverText.appendMarkdown(`作品: **${title}**`);

            const range = new vscode.Range(
              new vscode.Position(position.line, dateStart),
              new vscode.Position(position.line, dateEnd)
            );

            return new vscode.Hover(hoverText, range);
          }
        }

        // 检查鼠标是否悬浮在说明文字上
        if (
          (formatType === "dateNote" || formatType === "noIdDateNote") &&
          noteText
        ) {
          const noteStart = titleStart + title.length + completionDate.length;
          const noteEnd = noteStart + noteText.length;

          if (
            position.character >= noteStart &&
            position.character <= noteEnd
          ) {
            const cleanNote = noteText.replace(/[()]/g, "");
            const hoverText = new vscode.MarkdownString();
            hoverText.appendMarkdown(`**说明**\n\n`);
            hoverText.appendMarkdown(`${cleanNote}\n\n`);
            hoverText.appendMarkdown(`作品: **${title}**`);

            const range = new vscode.Range(
              new vscode.Position(position.line, noteStart),
              new vscode.Position(position.line, noteEnd)
            );

            return new vscode.Hover(hoverText, range);
          }
        }

        // 检查鼠标是否悬浮在观看标记+说明格式的说明文字上
        if (formatType === "watchMarksNote" && noteText) {
          const noteStart = titleStart + title.length + watchMarks.length;
          const noteEnd = noteStart + noteText.length;

          if (
            position.character >= noteStart &&
            position.character <= noteEnd
          ) {
            const cleanNote = noteText.replace(/[()]/g, "");
            const hoverText = new vscode.MarkdownString();
            hoverText.appendMarkdown(`**说明**\n\n`);
            hoverText.appendMarkdown(`${cleanNote}\n\n`);
            hoverText.appendMarkdown(`作品: **${title}**`);

            const range = new vscode.Range(
              new vscode.Position(position.line, noteStart),
              new vscode.Position(position.line, noteEnd)
            );

            return new vscode.Hover(hoverText, range);
          }
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
