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
      /^( {8})(?:\[(\d+)\])?(.+?)(?:\s*(√+))?(?:\s*<([^>]+)>)?(?:(?:(?<=√+)|(?<=<[^>]+>))\s*\(([^)]+)\))?\s*$/;
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

    // 重新计算各部分真实列位置，考虑标题/进度/日期/说明之间未捕获的空格
    // 初始光标位置：缩进 + 可选 ID + 原始标题（不 trim, 因为正则第三组是最小匹配并包含尾部空格）
    const idPart = bgmId ? `[${bgmId}]` : "";
    const rawTitle = titleRaw || ""; // 保留原样（含尾部空格）以便定位后续片段
    let cursor = indent.length + idPart.length + rawTitle.length; // 指向标题后第一个字符

    // 标题范围：用 trim 后的标题显示，但开始位置需要跳过标题前的空格（第三组最前不会有空格）
    // 处理：找到 rawTitle 中 trim 后的起始与结束偏移
    const leadingSpacesInTitle = rawTitle.length - rawTitle.trimStart().length;
    const trailingSpacesInTitle = rawTitle.length - rawTitle.trimEnd().length;
    const titleVisibleStart =
      indent.length + idPart.length + leadingSpacesInTitle;
    const titleVisibleText = rawTitle.trim();
    const titleRange = makeRange(titleVisibleStart, titleVisibleText);

    // 从标题结尾（含尾部空格）开始解析 marks/date/note，每次用剩余子串的前缀正则 ^\s*...
    const sliceFrom = (pos) => line.slice(pos);
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const locateSegment = (tokenText) => {
      const after = sliceFrom(cursor);
      const re = new RegExp(`^(\\s*)${escapeRegex(tokenText)}`);
      const mm = after.match(re);
      if (!mm) return null;
      const spacesLen = mm[1].length;
      const start = cursor + spacesLen;
      const rangeObj = makeRange(start, tokenText);
      cursor = start + tokenText.length;
      return rangeObj;
    };

    // 进度符号
    const marksRange = marks ? locateSegment(marks) : null;
    // 日期
    const dateToken = date ? `<${date}>` : null;
    const dateRange = dateToken ? locateSegment(dateToken) : null;
    // 说明
    const noteToken = note ? `(${note})` : null;
    const noteRange = noteToken ? locateSegment(noteToken) : null;

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
