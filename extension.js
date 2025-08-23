const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("BangumiPlan extension is now active!");

  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      { language: "bangumiplan" },
      new BgmLinkProvider()
    ),
    vscode.languages.registerHoverProvider(
      { language: "bangumiplan" },
      new hoverProvider()
    )
  );
}

class BgmLinkProvider {
  provideDocumentLinks(document) {
    const links = [];
    const regex = /\[(\d+)\]/g;
    let match;
    while ((match = regex.exec(document.getText())) !== null) {
      const id = match[1];
      const range = new vscode.Range(
        document.positionAt(match.index),
        document.positionAt(match.index + match[0].length)
      );
      const link = new vscode.DocumentLink(
        range,
        vscode.Uri.parse(`https://bgm.tv/subject/${id}`)
      );
      link.tooltip = `跳转到 BGM ID: ${id}`;
      links.push(link);
    }
    return links;
  }
}

class hoverProvider {
  provideHover(document, position) {
    const line = document.lineAt(position).text;

    // 与 tmLanguage.json 一致的正则
    const entryRegex =
      /^( {8})(?:\[(\d+)\])?(.+?)(?:\s*(√+))?(?:\s*<([^>]+)>)?(?:\s*(?:(?<=√+)|(?<=<[^>]+>))\(([^)]+)\))?\s*$/;
    const m = line.match(entryRegex);
    if (!m) return null;

    const [, indent, bgmId, titleRaw, marks, date, note] = m;
    const title = titleRaw?.trim() || "";

    // 工具函数：创建 Range + 匹配判定
    const makeRange = (start, text) => {
      const end = start + text.length;
      const inRange = position.character >= start && position.character <= end;
      return {
        range: new vscode.Range(position.line, start, position.line, end),
        inRange,
      };
    };

    // 基础偏移量
    let offset = indent.length;
    const idPart = bgmId ? `[${bgmId}]` : "";

    // 标题范围
    const titleStart = offset + idPart.length;
    const titleRange = makeRange(titleStart, title);

    // 进度符号范围（在标题后）
    const marksRange = marks
      ? makeRange(titleRange.range.end.character, marks)
      : null;

    // 日期范围（在进度符号后）
    const dateRange = date
      ? makeRange(
          marksRange?.range.end.character || titleRange.range.end.character,
          `<${date}>`
        )
      : null;

    // 说明范围（在日期后）
    const noteRange = note
      ? makeRange(
          dateRange?.range.end.character ||
            marksRange?.range.end.character ||
            titleRange.range.end.character,
          `(${note})`
        )
      : null;

    // 抽取 hover 内容构建函数
    const buildHover = (type, data) => {
      const md = new vscode.MarkdownString();
      switch (type) {
        case "marks": {
          const { marks } = data;
          md.appendMarkdown(`**观看进度**\n\n`);
          md.appendMarkdown(`已观看: **${marks.length}** 集\n\n`);
          md.appendMarkdown(`进度标记: \`${marks}\``);
          return md;
        }
        case "title": {
          const { title, bgmId, marks, date, note } = data;
          md.appendMarkdown(`**${title}**\n\n`);
          if (bgmId)
            md.appendMarkdown(
              `BGM ID: [${bgmId}](https://bgm.tv/subject/${bgmId})\n\n`
            );
          if (marks) {
            md.appendMarkdown(`观看进度: **${marks.length}** 集\n\n`);
            md.appendMarkdown(`进度标记: \`${marks}\`\n\n`);
          }
          if (date) md.appendMarkdown(`完成日期: **${date}**\n\n`);
          if (note) md.appendMarkdown(`说明: *${note}*`);
          return md;
        }
        case "date": {
          const { date, title } = data;
          md.appendMarkdown(`**完成日期**\n\n`);
          md.appendMarkdown(`日期: **${date}**\n\n`);
          md.appendMarkdown(`作品: **${title}**`);
          return md;
        }
        case "note": {
          const { note, title } = data;
          md.appendMarkdown(`**说明**\n\n`);
          md.appendMarkdown(`${note}\n\n`);
          md.appendMarkdown(`作品: **${title}**`);
          return md;
        }
        default:
          return md;
      }
    };

    if (marksRange?.inRange) {
      return new vscode.Hover(buildHover("marks", { marks }), marksRange.range);
    }
    if (title && titleRange.inRange) {
      return new vscode.Hover(
        buildHover("title", { title, bgmId, marks, date, note }),
        titleRange.range
      );
    }
    if (dateRange?.inRange) {
      return new vscode.Hover(
        buildHover("date", { date, title }),
        dateRange.range
      );
    }
    if (noteRange?.inRange) {
      return new vscode.Hover(
        buildHover("note", { note, title }),
        noteRange.range
      );
    }
    return null;
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
