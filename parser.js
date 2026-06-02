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

module.exports = {
  parseEntryLine,
  formatBangumiPlanDateTime,
  applyCurrentTimeToEntryLine,
};
