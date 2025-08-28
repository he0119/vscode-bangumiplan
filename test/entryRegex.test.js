// 使用 VS Code 扩展标准测试
const assert = require("assert");
const { parseEntryLine } = require("../extension.js");

// 使用 Mocha 的 describe/it 结构执行测试用例
describe("parseEntryLine", () => {
  it("基础格式 - 仅标题", () => {
    const input = "        功勋";
    const expected = {
      bgmId: undefined,
      title: "功勋",
      rawTitle: "功勋",
      marks: undefined,
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("基础格式 - 带BGM ID", () => {
    const input = "        [123456]作品名";
    const expected = {
      bgmId: "123456",
      title: "作品名",
      rawTitle: "作品名",
      marks: undefined,
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("带进度 - 无ID有进度无说明", () => {
    const input = "        功勋 √√√√√√√";
    const expected = {
      bgmId: undefined,
      title: "功勋",
      rawTitle: "功勋",
      marks: "√√√√√√√",
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("带进度 - 无ID有进度有说明", () => {
    const input = "        功勋 √√√√√√√ (就把最经典的看完了)";
    const expected = {
      bgmId: undefined,
      title: "功勋",
      rawTitle: "功勋",
      marks: "√√√√√√√",
      date: undefined,
      note: "就把最经典的看完了",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("带进度 - 有ID有进度无说明", () => {
    const input = "        [512190]琉璃的宝石 √√√√√√√";
    const expected = {
      bgmId: "512190",
      title: "琉璃的宝石",
      rawTitle: "琉璃的宝石",
      marks: "√√√√√√√",
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("带进度 - 有ID有进度有说明", () => {
    const input =
      "        [524707]我怎么可能成为你的恋人，不行不行！(※不是不可能！？) √√√√√√√";
    const expected = {
      bgmId: "524707",
      title: "我怎么可能成为你的恋人，不行不行！(※不是不可能！？)",
      rawTitle: "我怎么可能成为你的恋人，不行不行！(※不是不可能！？)",
      marks: "√√√√√√√",
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("带日期 - 有ID有日期无说明", () => {
    const input =
      "        [95225]Fate/stay night [Unlimited Blade Works]<2024-12-15>";
    const expected = {
      bgmId: "95225",
      title: "Fate/stay night [Unlimited Blade Works]",
      rawTitle: "Fate/stay night [Unlimited Blade Works]",
      marks: undefined,
      date: "2024-12-15",
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("带日期 - 有ID有日期有说明", () => {
    const input =
      "        [95225]Fate/stay night [Unlimited Blade Works]<2024-12-15>(经典作品)";
    const expected = {
      bgmId: "95225",
      title: "Fate/stay night [Unlimited Blade Works]",
      rawTitle: "Fate/stay night [Unlimited Blade Works]",
      marks: undefined,
      date: "2024-12-15",
      note: "经典作品",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("带日期 - 无ID有日期无说明", () => {
    const input = "        功勋<2024-08-20>";
    const expected = {
      bgmId: undefined,
      title: "功勋",
      rawTitle: "功勋",
      marks: undefined,
      date: "2024-08-20",
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("带日期 - 无ID有日期有说明", () => {
    const input = "        功勋<2024-08-20>(历史剧经典)";
    const expected = {
      bgmId: undefined,
      title: "功勋",
      rawTitle: "功勋",
      marks: undefined,
      date: "2024-08-20",
      note: "历史剧经典",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("特殊字符标题", () => {
    const input = "        标题·包含·中文符号 √√√";
    const expected = {
      bgmId: undefined,
      title: "标题·包含·中文符号",
      rawTitle: "标题·包含·中文符号",
      marks: "√√√",
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("英文标题", () => {
    const input = "        English Title Test √√√ (English note)";
    const expected = {
      bgmId: undefined,
      title: "English Title Test",
      rawTitle: "English Title Test",
      marks: "√√√",
      date: undefined,
      note: "English note",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("混合语言标题", () => {
    const input = "        Mixed 中英文 Title √√√ (Mixed note)";
    const expected = {
      bgmId: undefined,
      title: "Mixed 中英文 Title",
      rawTitle: "Mixed 中英文 Title",
      marks: "√√√",
      date: undefined,
      note: "Mixed note",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("空格处理", () => {
    const input = "        [123456]  带空格的标题  √√√  (  带空格的说明  )";
    const expected = {
      bgmId: "123456",
      title: "带空格的标题", // 标题会被trim()处理
      rawTitle: "  带空格的标题", // 原始标题，尾部空格被正则截断
      marks: "√√√",
      date: undefined,
      note: "  带空格的说明  ",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("复杂日期格式", () => {
    const input = "        [444444]短月份格式<2024-1-1>";
    const expected = {
      bgmId: "444444",
      title: "短月份格式",
      rawTitle: "短月份格式",
      marks: undefined,
      date: "2024-1-1",
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  // 多种进度标记测试
  it("进度标记 - 复选框符号☑", () => {
    const input = "        [123456]作品名 ☑☑☑";
    const expected = {
      bgmId: "123456",
      title: "作品名",
      rawTitle: "作品名",
      marks: "☑☑☑",
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("进度标记 - 绿色勾号✅", () => {
    const input = "        作品名 ✅✅✅✅";
    const expected = {
      bgmId: undefined,
      title: "作品名",
      rawTitle: "作品名",
      marks: "✅✅✅✅",
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("进度标记 - 勾号符号✓", () => {
    const input = "        [789012]测试作品 ✓✓✓✓✓ (使用勾号标记)";
    const expected = {
      bgmId: "789012",
      title: "测试作品",
      rawTitle: "测试作品",
      marks: "✓✓✓✓✓",
      date: undefined,
      note: "使用勾号标记",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("进度标记 - 复选标记✔", () => {
    const input = "        另一个作品 ✔✔✔";
    const expected = {
      bgmId: undefined,
      title: "另一个作品",
      rawTitle: "另一个作品",
      marks: "✔✔✔",
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("进度标记 - 特殊勾号🗸", () => {
    const input = "        [345678]特殊符号测试 🗸🗸🗸🗸🗸🗸";
    const expected = {
      bgmId: "345678",
      title: "特殊符号测试",
      rawTitle: "特殊符号测试",
      marks: "🗸🗸🗸🗸🗸🗸",
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("进度标记 - 混合符号", () => {
    const input = "        混合进度标记 √☑✅✓✔🗸";
    const expected = {
      bgmId: undefined,
      title: "混合进度标记",
      rawTitle: "混合进度标记",
      marks: "√☑✅✓✔🗸",
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("进度标记 - 复选框加日期", () => {
    const input = "        [111222]复选框测试 ☑☑☑☑<2024-12-25>";
    const expected = {
      bgmId: "111222",
      title: "复选框测试",
      rawTitle: "复选框测试",
      marks: "☑☑☑☑",
      date: "2024-12-25",
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("进度标记 - 绿色勾号加说明和日期", () => {
    const input = "        绿勾测试 ✅✅✅ (很棒的作品)<2024-11-15>";
    const expected = {
      bgmId: undefined,
      title: "绿勾测试",
      rawTitle: "绿勾测试",
      marks: "✅✅✅",
      date: "2024-11-15",
      note: "很棒的作品",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("进度标记 - 长标题带多种符号", () => {
    const input = "        [999888]这是一个很长的标题名称用来测试多种进度符号的解析 ✓✓✓✔✔☑✅√🗸 (综合测试用例)";
    const expected = {
      bgmId: "999888",
      title: "这是一个很长的标题名称用来测试多种进度符号的解析",
      rawTitle: "这是一个很长的标题名称用来测试多种进度符号的解析",
      marks: "✓✓✓✔✔☑✅√🗸",
      date: undefined,
      note: "综合测试用例",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  // 进度详情测试：支持 [正在观看 进度详情] 格式
  it("进度详情 - 正在观看格式无说明", () => {
    const input = "        [123456]作品名 [正在观看 第5集]";
    const expected = {
      bgmId: "123456",
      title: "作品名",
      rawTitle: "作品名",
      marks: undefined,
      progressDetail: "第5集",
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("进度详情 - 正在观看格式有说明", () => {
    const input = "        [123456]作品名 [正在观看 第5集] (很不错的动画)";
    const expected = {
      bgmId: "123456",
      title: "作品名",
      rawTitle: "作品名",
      marks: undefined,
      progressDetail: "第5集",
      date: undefined,
      note: "很不错的动画",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("进度详情 - 正在观看格式+完成日期", () => {
    const input = "        [123456]作品名 [正在观看 第5集] <2024/12/15>";
    const expected = {
      bgmId: "123456",
      title: "作品名",
      rawTitle: "作品名",
      marks: undefined,
      progressDetail: "第5集",
      date: "2024/12/15",
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("扩展日期格式 - 完成日期支持更多格式", () => {
    const input = "        [123456]作品名 <2024-12-15 10:30>";
    const expected = {
      bgmId: "123456",
      title: "作品名",
      rawTitle: "作品名",
      marks: undefined,
      progressDetail: undefined,
      date: "2024-12-15 10:30",
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });

  it("进度详情 - 无ID正在观看格式", () => {
    const input = "        作品名 [正在观看 第5集]";
    const expected = {
      bgmId: undefined,
      title: "作品名",
      rawTitle: "作品名",
      marks: undefined,
      progressDetail: "第5集",
      date: undefined,
      note: "",
    };

    const result = parseEntryLine(input);
    assert.ok(result !== null, "parseEntryLine should not return null");
    Object.keys(expected).forEach((key) => {
      assert.strictEqual(
        result[key],
        expected[key],
        `${key} should match expected value`
      );
    });
  });
});
