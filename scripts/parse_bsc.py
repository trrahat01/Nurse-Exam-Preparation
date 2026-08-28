import re, json, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

text = open(r"D:\React Native\Nurse Exam Preparation\scripts\_bsc_raw.txt", encoding="utf-8").read()
text = text.replace("* marks indicate correct answer", "")
text = text.replace("Nursing Science", "")

t = re.sub(r"\s+", " ", text)

questions = []
qp = re.compile(r"(?<!\d)(\d{1,3})\.\s")
nums = list(qp.finditer(t))
for idx, m in enumerate(nums):
    start = m.end()
    end = nums[idx + 1].start() if idx + 1 < len(nums) else len(t)
    seg = t[start:end].strip()
    questions.append({"num": int(m.group(1)), "seg": seg})

rows = []
opt_re = re.compile(r"\b([A-D])\)\s")
for q in questions:
    seg = q["seg"]
    om = list(opt_re.finditer(seg))
    if len(om) != 4:
        continue
    stem = seg[: om[0].start()].strip()
    opts = {}
    correct = None
    for i, mo in enumerate(om):
        key = mo.group(1)
        opt_start = mo.end()
        opt_end = om[i + 1].start() if i + 1 < len(om) else len(seg)
        txt = seg[opt_start:opt_end].strip()
        is_correct = "*" in txt
        txt = txt.replace("*", "").strip()
        opts[key.lower()] = txt
        if is_correct:
            correct = key.lower()
    if len(opts) != 4 or correct is None:
        continue
    rows.append({
        "category": "Nursing",
        "subcategory": "Fundamentals of Nursing",
        "exam_type": "bpsc",
        "subject": "Nursing",
        "chapter": "Fundamentals of Nursing",
        "question": stem,
        "option_a": opts["a"], "option_b": opts["b"],
        "option_c": opts["c"], "option_d": opts["d"],
        "correct_answer": correct,
        "explanation": "",
        "difficulty": "medium",
        "importance": 3,
        "active": True,
    })

print("parsed question segments:", len(questions), "rows:", len(rows))
out = r"D:\React Native\Nurse Exam Preparation\artifacts\mobile\src\data\nursing_bsc_mcqs.json"
json.dump(rows, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("wrote", out)
for r in rows[:3]:
    print(json.dumps(r, ensure_ascii=False))
