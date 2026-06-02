const vscode = require("vscode");

const INSERT_CURRENT_TIME_ACTION_KIND = vscode.CodeActionKind.Refactor.append(
  "insertCurrentTime"
);

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
    progressDescription: progressDescription || undefined,
    date: completionDate || undefined,
    dateDescription: dateDescription || undefined,
    note: note,
  };
}

function formatBangumiPlanDateTime(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `<${year}/${month}/${day} ${hours}:${minutes}>`;
}

function applyCurrentTimeToEntryLine(line, timestamp = formatBangumiPlanDateTime()) {
  if (!parseEntryLine(line)) return null;

  const existingDateRegex = /<[\d/\-:\s]+>/;
  if (existingDateRegex.test(line)) {
    return line.replace(existingDateRegex, timestamp);
  }

  const insertAt = line.trimEnd().length;
  return line.slice(0, insertAt) + timestamp + line.slice(insertAt);
}

function locateEntrySegments(line) {
  const parsed = parseEntryLine(line);
  if (!parsed) return null;

  const {
    bgmId,
    rawTitle,
    marks,
    progressDetail,
    progressDescription,
    date,
    dateDescription,
  } = parsed;
  const indentLength = 8;
  const idPart = bgmId ? `[${bgmId}]` : "";
  let cursor = indentLength + idPart.length + rawTitle.length;

  const createSegment = (start, text) => ({
    start,
    end: start + text.length,
    text,
  });

  const leadingSpacesInTitle = rawTitle.length - rawTitle.trimStart().length;
  const titleVisibleStart =
    indentLength + idPart.length + leadingSpacesInTitle;
  const titleVisibleText = rawTitle.trim();

  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const locateSegment = (tokenText) => {
    const after = line.slice(cursor);
    const re = new RegExp(`^(\\s*)${escapeRegex(tokenText)}`);
    const mm = after.match(re);
    if (!mm) return null;
    const start = cursor + mm[1].length;
    cursor = start + tokenText.length;
    return createSegment(start, tokenText);
  };

  return {
    parsed,
    title: titleVisibleText
      ? createSegment(titleVisibleStart, titleVisibleText)
      : null,
    marks: marks ? locateSegment(marks) : null,
    progressDetail: progressDetail
      ? locateSegment(`[正在观看 ${progressDetail}]`)
      : null,
    progressDescription: progressDescription
      ? locateSegment(`(${progressDescription})`)
      : null,
    date: date ? locateSegment(`<${date}>`) : null,
    dateDescription: dateDescription
      ? locateSegment(`(${dateDescription})`)
      : null,
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
    ),
    vscode.languages.registerCodeActionsProvider(
      { language: "bangumiplan" },
      new InsertCurrentTimeCodeActionProvider(),
      {
        providedCodeActionKinds: [INSERT_CURRENT_TIME_ACTION_KIND],
      }
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

    const segments = locateEntrySegments(line);
    if (!segments) return null;

    const {
      bgmId,
      title,
      marks,
      progressDetail,
      date,
      note,
      progressDescription,
      dateDescription,
    } = segments.parsed;

    const toHoverRange = (segment) =>
      new vscode.Range(position.line, segment.start, position.line, segment.end);
    const containsPosition = (segment) =>
      segment &&
      position.character >= segment.start &&
      position.character <= segment.end;

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

    if (containsPosition(segments.marks)) {
      return new vscode.Hover(
        buildHover("marks", { marks }),
        toHoverRange(segments.marks)
      );
    }
    if (containsPosition(segments.progressDetail)) {
      return new vscode.Hover(
        buildHover("progressDetail", { progressDetail, title }),
        toHoverRange(segments.progressDetail)
      );
    }
    if (title && containsPosition(segments.title)) {
      return new vscode.Hover(
        buildHover("title", {
          title,
          bgmId,
          marks,
          progressDetail,
          date,
          note,
        }),
        toHoverRange(segments.title)
      );
    }
    if (containsPosition(segments.date)) {
      return new vscode.Hover(
        buildHover("date", { date, title }),
        toHoverRange(segments.date)
      );
    }
    if (containsPosition(segments.progressDescription)) {
      return new vscode.Hover(
        buildHover("note", { note: progressDescription, title }),
        toHoverRange(segments.progressDescription)
      );
    }
    if (containsPosition(segments.dateDescription)) {
      return new vscode.Hover(
        buildHover("note", { note: dateDescription, title }),
        toHoverRange(segments.dateDescription)
      );
    }
    return null;
  }
}

class InsertCurrentTimeCodeActionProvider {
  provideCodeActions(document, range) {
    const line = document.lineAt(range.start.line);
    const newText = applyCurrentTimeToEntryLine(line.text);
    if (newText === null) return [];

    const action = new vscode.CodeAction(
      parseEntryLine(line.text)?.date ? "更新条目当前时间" : "给条目添加当前时间",
      INSERT_CURRENT_TIME_ACTION_KIND
    );
    const edit = new vscode.WorkspaceEdit();

    edit.replace(document.uri, line.range, newText);
    action.edit = edit;

    return [action];
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
  parseEntryLine,
  formatBangumiPlanDateTime,
  applyCurrentTimeToEntryLine,
  locateEntrySegments,
};
