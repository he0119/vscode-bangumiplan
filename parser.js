const ENTRY_REGEX_SOURCE =
  "^[ ]{8}(?:\\[(\\d+)\\])?(.+?)(?:\\s*(?:([√☑✅✓✔🗸]+)|\\[正在观看\\s+([^\\]]+)\\])(?:\\s*\\(([^)]+)\\))?)?(?:\\s*<([\\d/\\-:\\s]+)>(?:\\s*\\(([^)]+)\\))?)?\\s*$";
const ENTRY_REGEX = new RegExp(ENTRY_REGEX_SOURCE);

/**
 * 解析条目行的函数
 * @param {string} line - 要解析的行
 * @returns {object|null} - 解析结果对象或null
 */
function parseEntryLine(line) {
  const m = line.match(ENTRY_REGEX);
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

function findBgmIdLinks(text) {
  const links = [];
  let lineStart = 0;

  for (const line of text.split(/\r?\n/)) {
    const parsed = parseEntryLine(line);
    if (parsed?.bgmId) {
      const token = `[${parsed.bgmId}]`;
      const tokenStart = line.indexOf(token);
      if (tokenStart !== -1) {
        links.push({
          id: parsed.bgmId,
          start: lineStart + tokenStart,
          end: lineStart + tokenStart + token.length,
        });
      }
    }

    lineStart += line.length + 1;
  }

  return links;
}

module.exports = {
  ENTRY_REGEX_SOURCE,
  parseEntryLine,
  formatBangumiPlanDateTime,
  applyCurrentTimeToEntryLine,
  locateEntrySegments,
  findBgmIdLinks,
};
