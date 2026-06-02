const vscode = require("vscode");
const {
  ENTRY_REGEX_SOURCE,
  parseEntryLine,
  formatBangumiPlanDateTime,
  applyCurrentTimeToEntryLine,
  locateEntrySegments,
  findBgmIdLinks,
} = require("./parser");

const INSERT_CURRENT_TIME_ACTION_KIND = vscode.CodeActionKind.Refactor.append(
  "insertCurrentTime"
);

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
    return findBgmIdLinks(document.getText()).map(({ id, start, end }) => {
      const range = new vscode.Range(
        document.positionAt(start),
        document.positionAt(end)
      );
      const link = new vscode.DocumentLink(
        range,
        vscode.Uri.parse(`https://bgm.tv/subject/${id}`)
      );
      link.tooltip = `跳转到 BGM ID: ${id}`;
      return link;
    });
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
  ENTRY_REGEX_SOURCE,
  parseEntryLine,
  formatBangumiPlanDateTime,
  applyCurrentTimeToEntryLine,
  locateEntrySegments,
  findBgmIdLinks,
};
