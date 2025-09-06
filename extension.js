const vscode = require("vscode");

/**
 * 解析条目行的函数
 * @param {string} line - 要解析的行
 * @returns {object|null} - 解析结果对象或null
 */
function parseEntryLine(line) {
  const indentLength = 8;

  // 与 tmLanguage.json 一致的正则
  const entryRegex = new RegExp(
    `^\\s{${indentLength}}(?:\\[(\\d+)\\])?(.+?)(?:\\s*(?:([√☑✅✓✔🗸]+)|\\[正在观看\\s+([^\\]]+)\\])(?:\\s*\\(([^)]+)\\))?)?(?:\\s*<([\\d/\\-:\\s]+)>(?:\\s*\\(([^)]+)\\))?)?\\s*$`
  );
  const m = line.match(entryRegex);
  if (!m) return null;

  // 捕获组对应：
  // 1: subject_id (bgmId)
  // 2: 名称 (name)
  // 3: 进度标记 (episode_progress)
  // 4: 进度详情 (progress_detail)
  // 5: 进度说明 (progress_description)
  // 6: 完成时间 (completion_date)
  // 7: 日期说明 (date_description)
  const [
    ,
    subjectId,
    nameRaw,
    episodeProgress,
    progressDetail,
    progressDescription,
    completionDate,
    dateDescription,
  ] = m;
  const name = nameRaw?.trim() || "";
  const note = progressDescription || dateDescription || "";

  return {
    bgmId: subjectId || undefined,
    title: name,
    rawTitle: nameRaw || "",
    marks: episodeProgress || undefined,
    progressDetail: progressDetail || undefined,
    date: completionDate || undefined,
    note: note,
  };
}

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

    // 使用新的 parseEntryLine 函数
    const parsed = parseEntryLine(line);
    if (!parsed) return null;

    const { bgmId, title, rawTitle, marks, progressDetail, date, note } =
      parsed;

    const indentLength = 8;

    // 工具函数：创建 Range + 判断光标是否在其中
    const makeRange = (start, text) => {
      const end = start + text.length;
      const inRange = position.character >= start && position.character <= end;
      return {
        range: new vscode.Range(position.line, start, position.line, end),
        inRange,
      };
    };

    // 重新计算各部分真实列位置
    const idPart = bgmId ? `[${bgmId}]` : "";
    let cursor = indentLength + idPart.length + rawTitle.length;

    // 标题范围：用 trim 后的标题显示，但起始位置需要考虑原始空格
    const leadingSpacesInTitle = rawTitle.length - rawTitle.trimStart().length;
    const titleVisibleStart =
      indentLength + idPart.length + leadingSpacesInTitle;
    const titleVisibleText = rawTitle.trim();
    const titleRange = makeRange(titleVisibleStart, titleVisibleText);

    // 辅助函数：从当前位置开始匹配 token
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

    // 进度符号或进度详情
    const marksRange = marks ? locateSegment(marks) : null;
    const progressDetailToken = progressDetail
      ? `[正在观看 ${progressDetail}]`
      : null;
    const progressDetailRange = progressDetailToken
      ? locateSegment(progressDetailToken)
      : null;

    // 日期
    const dateToken = date ? `<${date}>` : null;
    const dateRange = dateToken ? locateSegment(dateToken) : null;
    // 备注
    const noteToken = note ? `(${note})` : null;
    const noteRange = noteToken ? locateSegment(noteToken) : null;

    // Hover 内容构建函数
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
        case "progressDetail": {
          const { progressDetail, title } = data;
          md.appendMarkdown(`**观看状态**\n\n`);
          md.appendMarkdown(`正在观看: **${progressDetail}**\n\n`);
          md.appendMarkdown(`作品: **${title}**`);
          return md;
        }
        case "title": {
          const { title, bgmId, marks, progressDetail, date, note } = data;
          md.appendMarkdown(`**${title}**\n\n`);
          if (bgmId)
            md.appendMarkdown(
              `BGM ID: [${bgmId}](https://bgm.tv/subject/${bgmId})\n\n`
            );
          if (marks) {
            md.appendMarkdown(`观看进度: **${marks.length}** 集\n\n`);
            md.appendMarkdown(`进度标记: \`${marks}\`\n\n`);
          }
          if (progressDetail) {
            md.appendMarkdown(`观看状态: **正在观看 ${progressDetail}**\n\n`);
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
    if (progressDetailRange?.inRange) {
      return new vscode.Hover(
        buildHover("progressDetail", { progressDetail, title }),
        progressDetailRange.range
      );
    }
    if (title && titleRange.inRange) {
      return new vscode.Hover(
        buildHover("title", {
          title,
          bgmId,
          marks,
          progressDetail,
          date,
          note,
        }),
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

module.exports = { activate, deactivate, parseEntryLine };
