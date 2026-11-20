#!/usr/bin/env python3
"""BoardPrep data builder - JAC packs ko ek clean JSON/JS me badalta hai."""
import ast
import json
import os
import re
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "assets", "data")
PDF_OUT = os.path.join(ROOT, "assets", "pdfs")

SRC_JSON = "/mnt/e/logo/class10/website/js/data"
SRC_BIG = "/mnt/e/logo/class 10"
SRC_JAC = "/mnt/e/logo/class10"

os.makedirs(OUT, exist_ok=True)
os.makedirs(PDF_OUT, exist_ok=True)

SUBJECT_META = [
    {"key": "hindi", "name": "हिंदी", "en": "Hindi", "color": "#ef4444"},
    {"key": "english", "name": "English", "en": "English", "color": "#3b82f6"},
    {"key": "maths", "name": "गणित", "en": "Mathematics", "color": "#f59e0b"},
    {"key": "science", "name": "विज्ञान", "en": "Science", "color": "#10b981"},
    {"key": "sst", "name": "सामाजिक विज्ञान", "en": "Social Science", "color": "#8b5cf6"},
    {"key": "sanskrit", "name": "संस्कृत", "en": "Sanskrit", "color": "#ec4899"},
]

FILE_MAP = {
    "hindi.json": ("hindi", None),
    "english.json": ("english", None),
    "maths.json": ("maths", None),
    "physics.json": ("science", "भौतिक विज्ञान"),
    "chemistry.json": ("science", "रसायन विज्ञान"),
    "biology.json": ("science", "जीव विज्ञान"),
    "history.json": ("sst", "इतिहास"),
    "geography.json": ("sst", "भूगोल"),
    "civics.json": ("sst", "राजनीति विज्ञान"),
    "economics.json": ("sst", "अर्थशास्त्र"),
}

BIG_MAP = {
    "Hindi-MCQ.txt": "hindi",
    "English-MCQ.txt": "english",
    "Mathematics-MCQ.txt": "maths",
    "Science-MCQ.txt": "science",
    "Social-Science-MCQ.txt": "sst",
    "Sanskrit-MCQ.txt": "sanskrit",
}

OPT_RE = re.compile(r"^\s*\(?([A-Da-d]|क|ख|ग|घ)\)?[.\)]\s+(.+)$")
ANS_RE = re.compile(r"^\s*(?:ANSWER|Ans|उत्तर)\s*[:：]\s*\(?([A-Da-d]|क|ख|ग|घ)\)?")
EXP_RE = re.compile(r"^\s*(?:Explain|Explanation|Solution|हल)\s*[:：]\s*(.*)$")


def norm(text):
    return re.sub(r"[\s\W_]+", "", text.lower())


def load_subject_jsons():
    items = []
    for fname, (subj, part) in FILE_MAP.items():
        path = os.path.join(SRC_JSON, fname)
        data = json.load(open(path, encoding="utf-8"))
        chapters = data.get("chapters", [])
        for q in data.get("questions", []):
            opts = q.get("options")
            if isinstance(opts, str):
                try:
                    opts = ast.literal_eval(opts)
                except Exception:
                    opts = [x.strip() for x in opts.split("|") if x.strip()]
            ans = q.get("answer")
            if isinstance(ans, str) and len(ans) == 1 and ans.isalpha() and ans.upper() in "ABCD":
                ans = ans.upper()
            elif isinstance(ans, str) and ans.isdigit() and opts:
                idx = int(ans)
                ans = "ABCD"[idx] if 0 <= idx < len(opts) else ""
            else:
                ans = ""
            items.append({
                "id": "j-" + str(q.get("id", "")),
                "subj": subj,
                "part": part or q.get("chapter", "").split(":")[0],
                "chap": q.get("chapter", "") or "Mixed Practice",
                "type": "mcq" if opts else "write",
                "q": q.get("q", "").strip(),
                "opts": opts or [],
                "ans": ans,
                "exp": (q.get("ans", "") or "").strip(),
            })
    return items


def parse_big_mcq(path, subj):
    out = []
    cur = None
    chap = ""
    pending_q = False

    def flush():
        nonlocal cur
        if cur and cur["q"]:
            if cur["type"] == "mcq" and not cur["ans"]:
                cur["type"] = "write"
            out.append(cur)
        cur = None

    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.strip()
            if not line:
                continue
            if line.startswith("#"):
                head = line.lstrip("#").strip()
                if "Objective Questions" not in head and head:
                    chap = head
                continue
            if line.startswith("==") or line.startswith("Source:") or line.startswith("Class 10 -"):
                continue
            if re.match(r"^(JAC Board|NCERT)", line) and len(line) < 60:
                continue
            om = OPT_RE.match(line)
            am = ANS_RE.match(line)
            em = EXP_RE.match(line)
            if om:
                if cur is None:
                    cur = {"opts": [], "ans": "", "exp": "", "q": "", "type": "mcq"}
                cur["opts"].append(om.group(2).strip())
                continue
            if am:
                if cur is None:
                    cur = {"opts": [], "ans": "", "exp": "", "q": "", "type": "write"}
                cur["ans"] = am.group(1)
                if cur["ans"] in "कखगघ":
                    cur["ans"] = {"क": "A", "ख": "B", "ग": "C", "घ": "D"}[cur["ans"]]
                cur["ans"] = cur["ans"].upper()
                continue
            if em:
                if cur is not None:
                    cur["exp"] = em.group(1).strip()
                continue
            if len(line) > 2:
                flush()
                cur = {
                    "id": "m-%s-%d" % (subj, len(out) + 1),
                    "subj": subj,
                    "part": "",
                    "chap": chap or "Objective Bank",
                    "type": "mcq",
                    "q": line,
                    "opts": [],
                    "ans": "",
                    "exp": "",
                }
    flush()
    return out


def parse_important():
    path = os.path.join(SRC_BIG, "Important-Questions", "Important-Questions-2027-All-Subjects.txt")
    text = open(path, encoding="utf-8").read()
    heads = []
    for m in re.finditer(
            r"^(गणित|विज्ञान|सामाजिक विज्ञान|Hindi|English|संस्कृत)\b.*\((\d+)\s*Marks\)",
            text, re.M):
        heads.append((m.start(), m.group(0).strip()))
    blocks = []
    for i, (pos, head) in enumerate(heads):
        end = heads[i + 1][0] if i + 1 < len(heads) else len(text)
        body = text[pos:end].strip()
        blocks.append({"title": head, "text": body})
    return blocks


def load_frequency():
    spec = importlib.util.spec_from_file_location(
        "frequency_data", os.path.join(SRC_JAC, "Scripts", "frequency_data.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    rows = []
    for subj, q, times, years in mod.FREQUENCY_ANALYSIS:
        key = {"Hindi": "hindi", "English": "english", "Maths": "maths",
               "Science": "science", "SST": "sst", "Sanskrit": "sanskrit"}.get(subj, "")
        rows.append({"subj": key, "topic": q, "times": int(times), "years": years})
    return rows


def collect_papers():
    papers = []
    for entry in sorted(os.listdir(SRC_BIG)):
        m = re.match(r"^(PYQ|Model-Papers)-(\d{4})$", entry)
        if not m:
            continue
        kind, year = m.group(1), m.group(2)
        dp = os.path.join(SRC_BIG, entry)
        label = "पिछले वर्षों के प्रश्न पत्र" if kind == "PYQ" else "मॉडल पेपर"
        for f in sorted(os.listdir(dp)):
            if f.lower().endswith(".pdf"):
                papers.append({
                    "kind": kind, "year": year, "name": f[:-4], "file": f,
                    "src": os.path.join(dp, f), "label": label,
                })
    return papers


def copy_pdfs(papers, limit_mb=80):
    total = sum(os.path.getsize(p["src"]) for p in papers) / 1e6
    copied = []
    if total > limit_mb:
        keep = [p for p in papers if p["year"] in ("2025", "2026")]
    else:
        keep = papers
    for p in keep:
        dst_dir = os.path.join(PDF_OUT, p["kind"].lower(), p["year"])
        os.makedirs(dst_dir, exist_ok=True)
        dst = os.path.join(dst_dir, p["file"])
        if not os.path.exists(dst):
            shutil.copy2(p["src"], dst)
        p2 = dict(p)
        p2["url"] = "assets/pdfs/%s/%s/%s" % (p["kind"].lower(), p["year"], p["file"])
        copied.append(p2)
    return copied, total


def main():
    items = load_subject_jsons()
    seen = set()
    uniq = []
    for q in items:
        k = norm(q["q"])
        if k and k not in seen:
            seen.add(k)
            uniq.append(q)
    items = uniq
    print("subject json:", len(items))

    for fname, subj in BIG_MAP.items():
        path = os.path.join(SRC_BIG, "MCQ", fname)
        qs = parse_big_mcq(path, subj)
        added = 0
        for q in qs:
            k = norm(q["q"])
            if k and k not in seen:
                seen.add(k)
                items.append(q)
                added += 1
        print(fname, "parsed", len(qs), "added", added)

    important = parse_important()
    freq = load_frequency()
    papers, pdf_total = copy_pdfs(collect_papers())

    data = {
        "subjects": SUBJECT_META,
        "questions": items,
        "important": important,
        "freq": freq,
        "papers": papers,
        "pdfTotalMb": round(pdf_total, 1),
    }
    js = "window.BOARD_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    with open(os.path.join(OUT, "data.js"), "w", encoding="utf-8") as fh:
        fh.write(js)
    print("total questions:", len(items))
    print("important blocks:", len(important))
    print("freq rows:", len(freq))
    print("papers:", len(papers), "pdf mb:", round(pdf_total, 1))
    print("data.js bytes:", len(js.encode("utf-8")))


if __name__ == "__main__":
    import importlib.util
    main()
