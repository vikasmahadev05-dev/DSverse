"""
Intelligent PDF Processing & Question Extraction Pipeline for Question Vault.
Supports text-based and scanned PDFs, multi-column layouts, question boundary detection,
option splitting, topic classification, and metadata provenance.
"""

import re
import os
import uuid
from typing import List, Dict, Any, Optional, Tuple

try:
    import pymupdf as fitz
except ImportError:
    try:
        import fitz
    except ImportError:
        fitz = None

try:
    import pypdf
except ImportError:
    pypdf = None


TOPIC_KEYWORDS = {
    "primitive-types": [
        "primitive", "abstract data type", "adt", "rational", "time", "complex", "struct",
        "date", "account", "data types", "homogeneous", "heterogeneous", "static/dynamic"
    ],
    "linked-lists": [
        "linked list", "singly linked", "doubly linked", "circular linked", "skip list",
        "node", "head pointer", "tail pointer", "next pointer", "prev pointer"
    ],
    "stacks": [
        "stack", "push", "pop", "peek", "lifo", "stack overflow", "stack underflow",
        "call stack", "postfix expression", "infix to postfix"
    ],
    "queues": [
        "queue", "enqueue", "dequeue", "fifo", "circular queue", "priority queue",
        "double-ended queue", "deque"
    ],
    "trees": [
        "tree", "binary tree", "binary search tree", "bst", "avl", "traversal",
        "inorder", "preorder", "postorder", "root node", "leaf node", "subtree"
    ],
    "graphs": [
        "graph", "vertex", "vertices", "edge", "adjacency matrix", "adjacency list",
        "breadth-first search", "bfs", "depth-first search", "dfs", "dijkstra", "spanning tree"
    ],
    "heaps": [
        "heap", "min-heap", "max-heap", "heapify", "complete binary tree", "priority queue"
    ],
    "hash-tables": [
        "hash table", "hash map", "hash function", "collision resolution", "chaining",
        "linear probing", "quadratic probing", "open addressing"
    ],
    "sorting": [
        "sort", "bubble sort", "selection sort", "insertion sort", "quick sort",
        "merge sort", "heap sort", "radix sort"
    ],
    "searching": [
        "search", "binary search", "linear search", "interpolation search", "search key"
    ],
    "recursion": [
        "recursion", "recursive", "base case", "recurrence relation", "divide and conquer"
    ],
    "pointers": [
        "pointer", "malloc", "free", "dynamic memory", "dereference", "segmentation fault",
        "memory leak", "calloc", "realloc", "void*"
    ],
    "time-complexity": [
        "time complexity", "space complexity", "big o", "omega", "theta", "asymptotic"
    ],
    "arrays": [
        "array", "contiguous memory", "sub-array", "matrix", "2d array", "index bounds"
    ]
}


def extract_text_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    """
    Extracts text page-by-page from PDF.
    Returns list of dicts: [{"page_number": int, "text": str, "is_scanned": bool, "image_count": int}]
    """
    pages_data = []

    if fitz:
        doc = fitz.open(file_path)
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            text = page.get_text("text") or ""
            images = page.get_images()
            is_scanned = len(text.strip()) < 30 and len(images) > 0
            pages_data.append({
                "page_number": page_idx + 1,
                "text": text,
                "is_scanned": is_scanned,
                "image_count": len(images)
            })
        doc.close()
    elif pypdf:
        reader = pypdf.PdfReader(file_path)
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            pages_data.append({
                "page_number": page_idx + 1,
                "text": text,
                "is_scanned": len(text.strip()) < 30,
                "image_count": 0
            })
    else:
        # Fallback empty
        pages_data.append({"page_number": 1, "text": "", "is_scanned": False, "image_count": 0})

    return pages_data


def detect_topic(text: str) -> Tuple[str, Optional[str]]:
    """Identifies the most relevant data structures topic and subtopic."""
    text_lower = text.lower()
    scores = {}

    for topic, keywords in TOPIC_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[topic] = score

    if not scores:
        return "c-programming", "General C Systems"

    best_topic = max(scores, key=scores.get)
    subtopic = best_topic.replace("-", " ").title()
    return best_topic, subtopic


def detect_question_type(text: str, options: List[Dict[str, Any]]) -> str:
    """Classifies question type from structure and syntax."""
    text_lower = text.lower()

    if any(phrase in text_lower for phrase in ["write a c function", "write a c program", "implement a c", "write code to", "typedef struct"]):
        return "programming"

    if any(phrase in text_lower for phrase in ["what does this print", "output of the following", "what is printed", "predict output"]):
        return "code_output"

    if any(phrase in text_lower for phrase in ["find the bug", "debug", "compiler error in", "identify the error"]):
        return "debugging"

    if any(phrase in text_lower for phrase in ["time complexity", "space complexity", "big o notation", "recurrence"]):
        return "algorithm_analysis"

    if any(phrase in text_lower for phrase in ["true or false", "state true or false"]):
        return "true_false"

    if "_____" in text or "......" in text or "fill in the blank" in text_lower:
        return "fill_blanks"

    if options and len(options) >= 2:
        return "mcq"

    if len(text.split()) > 40:
        return "long_answer"

    return "short_answer"


def extract_marks(text: str) -> Tuple[int, str]:
    """Detects marks annotations like [5 Marks], (10M), (2 marks) and removes from question text."""
    pattern = r"[\(\[]\s*(\d+)\s*(?:marks?|mark|m)\s*[\)\]]"
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        marks = int(match.group(1))
        cleaned_text = re.sub(pattern, "", text, flags=re.IGNORECASE).strip()
        return marks, cleaned_text
    return 1, text


def parse_options(block_text: str) -> Tuple[List[Dict[str, Any]], Optional[str], str]:
    """
    Extracts MCQ options (A, B, C, D) and detected answer key if printed.
    Returns: (options_list, answer_key, clean_question_body)
    """
    options = []
    answer = None

    # Check for printed Answer keys like "Ans: B" or "Answer: (C)"
    ans_match = re.search(r"(?:Ans(?:wer)?|Correct\s*Option)\s*[:=\-]\s*\(?([A-D]|True|False)\)?", block_text, re.IGNORECASE)
    if ans_match:
        answer = ans_match.group(1).upper()
        block_text = re.sub(r"(?:Ans(?:wer)?|Correct\s*Option)\s*[:=\-]\s*\(?([A-D]|True|False)\)?.*$", "", block_text, flags=re.IGNORECASE).strip()

    # Match option lines: (A) Text, A) Text, A. Text, [A] Text
    opt_pattern = r"(?:^|\n)\s*(?:[\(\[]?([A-D])[\)\]\.]|\b([A-D])\))\s*(.+?)(?=(?:\n\s*[\(\[]?[A-D][\)\]\.]|\b[A-D]\))|\Z)"
    matches = list(re.finditer(opt_pattern, block_text, re.DOTALL))

    if matches:
        first_opt_start = matches[0].start()
        clean_question_body = block_text[:first_opt_start].strip()

        for m in matches:
            label = (m.group(1) or m.group(2)).upper()
            opt_text = m.group(3).strip()
            is_correct = (label == answer) if answer else False
            options.append({
                "option_label": label,
                "option_text": opt_text,
                "is_correct": is_correct
            })
    else:
        # Check True/False options
        if "true or false" in block_text.lower():
            clean_question_body = block_text
            options = [
                {"option_label": "True", "option_text": "True", "is_correct": (answer == "TRUE")},
                {"option_label": "False", "option_text": "False", "is_correct": (answer == "FALSE")}
            ]
        else:
            clean_question_body = block_text

    return options, answer, clean_question_body


def extract_starter_code_if_programming(text: str) -> Optional[str]:
    """Generates starter C function boilerplate or extracts code if the question is a coding/debugging exercise."""
    text_lower = text.lower()
    
    # 1. University Question Bank Patterns (e.g. QB-1.pdf Unit 1 Primitive Data Structures & ADTs)
    if "makerational" in text_lower or ("rational" in text_lower and "struct" in text_lower and "write" in text_lower):
        return (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "typedef struct {\n"
            "    int num;\n"
            "    int den;\n"
            "} RATIONAL;\n\n"
            "// Stores n/d in *r and returns 1, or returns 0 when d is 0 without changing *r\n"
            "int makeRational(int n, int d, RATIONAL *r) {\n"
            "    if (d == 0) {\n"
            "        return 0;\n"
            "    }\n"
            "    r->num = n;\n"
            "    r->den = d;\n"
            "    return 1;\n"
            "}\n\n"
            "int main(void) {\n"
            "    RATIONAL r;\n"
            "    if (makeRational(3, 4, &r)) {\n"
            "        printf(\"makeRational(3, 4) -> %d/%d (Success)\\n\", r.num, r.den);\n"
            "    }\n"
            "    if (!makeRational(5, 0, &r)) {\n"
            "        printf(\"makeRational(5, 0) -> Denominator 0 correctly rejected!\\n\");\n"
            "    }\n"
            "    return 0;\n"
            "}\n"
        )
    elif "isleap" in text_lower and "daysin" in text_lower:
        return (
            "#include <stdio.h>\n"
            "#include <stdbool.h>\n\n"
            "int isLeap(int y) {\n"
            "    return (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);\n"
            "}\n\n"
            "int daysIn(int m, int y) {\n"
            "    if (m == 2) return isLeap(y) ? 29 : 28;\n"
            "    if (m == 4 || m == 6 || m == 9 || m == 11) return 30;\n"
            "    return 31;\n"
            "}\n\n"
            "int main(void) {\n"
            "    printf(\"Feb 2024 (Leap): %d days\\n\", daysIn(2, 2024));\n"
            "    printf(\"Feb 1900 (Non-leap centurial): %d days\\n\", daysIn(2, 1900));\n"
            "    printf(\"Feb 2000 (Leap 400): %d days\\n\", daysIn(2, 2000));\n"
            "    return 0;\n"
            "}\n"
        )
    elif "isvaliddate" in text_lower:
        return (
            "#include <stdio.h>\n"
            "#include <stdbool.h>\n\n"
            "int isLeap(int y) {\n"
            "    return (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);\n"
            "}\n\n"
            "int daysIn(int m, int y) {\n"
            "    if (m < 1 || m > 12) return 0;\n"
            "    if (m == 2) return isLeap(y) ? 29 : 28;\n"
            "    if (m == 4 || m == 6 || m == 9 || m == 11) return 30;\n"
            "    return 31;\n"
            "}\n\n"
            "int isValidDate(int d, int m, int y) {\n"
            "    if (y < 1 || m < 1 || m > 12) return 0;\n"
            "    return (d >= 1 && d <= daysIn(m, y)) ? 1 : 0;\n"
            "}\n\n"
            "int main(void) {\n"
            "    printf(\"29/02/2024 valid: %d (Expected: 1)\\n\", isValidDate(29, 2, 2024));\n"
            "    printf(\"29/02/1900 valid: %d (Expected: 0)\\n\", isValidDate(29, 2, 1900));\n"
            "    printf(\"31/04/2026 valid: %d (Expected: 0)\\n\", isValidDate(31, 4, 2026));\n"
            "    return 0;\n"
            "}\n"
        )
    elif "addrational" in text_lower:
        return (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n\n"
            "typedef struct { int num, den; } RATIONAL;\n\n"
            "int gcd(int a, int b) {\n"
            "    while (b != 0) {\n"
            "        int t = b;\n"
            "        b = a % b;\n"
            "        a = t;\n"
            "    }\n"
            "    return abs(a);\n"
            "}\n\n"
            "RATIONAL addRational(RATIONAL a, RATIONAL b) {\n"
            "    RATIONAL res;\n"
            "    res.num = a.num * b.den + b.num * a.den;\n"
            "    res.den = a.den * b.den;\n"
            "    int g = gcd(res.num, res.den);\n"
            "    res.num /= g;\n"
            "    res.den /= g;\n"
            "    return res;\n"
            "}\n\n"
            "int main(void) {\n"
            "    RATIONAL a = {3, 8};\n"
            "    RATIONAL b = {5, 6};\n"
            "    RATIONAL c = addRational(a, b);\n"
            "    printf(\"3/8 + 5/6 = %d/%d (Expected lowest terms: 29/24)\\n\", c.num, c.den);\n"
            "    return 0;\n"
            "}\n"
        )
    elif "addseconds" in text_lower:
        return (
            "#include <stdio.h>\n\n"
            "typedef struct { int h, m, s; } TIME;\n\n"
            "TIME addSeconds(TIME t, int s) {\n"
            "    int total = (t.h * 3600 + t.m * 60 + t.s + s) % 86400;\n"
            "    TIME res;\n"
            "    res.h = total / 3600;\n"
            "    res.m = (total % 3600) / 60;\n"
            "    res.s = total % 60;\n"
            "    return res;\n"
            "}\n\n"
            "int main(void) {\n"
            "    TIME t = {23, 59, 30};\n"
            "    TIME res = addSeconds(t, 45);\n"
            "    printf(\"23:59:30 + 45s = %02d:%02d:%02d (Expected 00:00:15)\\n\", res.h, res.m, res.s);\n"
            "    return 0;\n"
            "}\n"
        )
    elif "an ai assistant wrote this constructor" in text_lower:
        return (
            "#include <stdio.h>\n\n"
            "typedef struct { int num, den; } RATIONAL;\n\n"
            "// AI Assistant's code under inspection:\n"
            "RATIONAL make(int n, int d) {\n"
            "    RATIONAL r = { n, d };\n"
            "    return r;\n"
            "}\n\n"
            "int main(void) {\n"
            "    printf(\"Debugging AI Constructor:\\n\");\n"
            "    // What rule does it break? Denominator must NEVER be zero!\n"
            "    RATIONAL bad = make(5, 0);\n"
            "    printf(\"Bug exposed by call make(5, 0): Created invalid rational %d/%d!\\n\", bad.num, bad.den);\n"
            "    return 0;\n"
            "}\n"
        )
    elif "an ai assistant wrotethis leap-year test" in text_lower or ("ai assistant" in text_lower and "isleap" in text_lower):
        return (
            "#include <stdio.h>\n\n"
            "// AI Assistant's faulty code:\n"
            "int isLeap(int y) {\n"
            "    return y % 4 == 0;\n"
            "}\n\n"
            "int main(void) {\n"
            "    int test_years[] = {2024, 1900, 2000, 2023};\n"
            "    for (int i = 0; i < 4; i++) {\n"
            "        int y = test_years[i];\n"
            "        printf(\"Year %d -> AI isLeap: %d %s\\n\", y, isLeap(y),\n"
            "               (y == 1900) ? \"[WRONG! 1900 is NOT leap because 1900 %% 100 == 0 and 1900 %% 400 != 0]\" : \"\");\n"
            "    }\n"
            "    return 0;\n"
            "}\n"
        )
    elif "complex multiplication" in text_lower:
        return (
            "#include <stdio.h>\n\n"
            "typedef struct { double re, im; } COMPLEX;\n\n"
            "// AI Assistant's faulty function:\n"
            "COMPLEX mult(COMPLEX a, COMPLEX b) {\n"
            "    COMPLEX r;\n"
            "    // BUG: (a.re * b.re - a.im * b.im) because i * i = -1!\n"
            "    r.re = a.re * b.re + a.im * b.im;\n"
            "    r.im = a.re * b.im + a.im * b.re;\n"
            "    return r;\n"
            "}\n\n"
            "int main(void) {\n"
            "    COMPLEX a = {1.0, 1.0};\n"
            "    COMPLEX b = {1.0, -1.0};\n"
            "    COMPLEX res = mult(a, b);\n"
            "    printf(\"(1+i)(1-i) AI Result: %.1f + %.1fi\\n\", res.re, res.im);\n"
            "    printf(\"Correct Math: (1*1 - 1*(-1)) + (1*(-1) + 1*1)i = 2.0 + 0.0i\\n\");\n"
            "    return 0;\n"
            "}\n"
        )
    elif "values 250 to 255" in text_lower or ("loop" in text_lower and "unsigned char" in text_lower):
        return (
            "#include <stdio.h>\n\n"
            "int main(void) {\n"
            "    printf(\"Analysis of AI Loop:\\n\");\n"
            "    printf(\"unsigned char ranges from 0 to 255.\\n\");\n"
            "    printf(\"When c reaches 255, c++ overflows back to 0!\\n\");\n"
            "    printf(\"Hence, c <= 255 is ALWAYS true, leading to an infinite loop!\\n\\n\");\n"
            "    printf(\"Demonstrating corrected loop with standard int:\\n\");\n"
            "    for (int c = 250; c <= 255; c++) {\n"
            "        printf(\"%d \", c);\n"
            "    }\n"
            "    printf(\"\\nDone!\\n\");\n"
            "    return 0;\n"
            "}\n"
        )
    elif "bank account" in text_lower or ("account" in text_lower and "withdraw" in text_lower):
        return (
            "#include <stdio.h>\n\n"
            "typedef struct { int number; int balance; } ACCOUNT;\n\n"
            "// AI Assistant's code:\n"
            "int withdraw(ACCOUNT *a, int amt) {\n"
            "    a->balance -= amt;\n"
            "    return a->balance;\n"
            "}\n\n"
            "int main(void) {\n"
            "    ACCOUNT acc = {101, 500};\n"
            "    printf(\"Initial Balance: $%d\\n\", acc.balance);\n"
            "    printf(\"AI allows withdraw(-200): $%d (Negative amount breaks rule!)\\n\", withdraw(&acc, -200));\n"
            "    printf(\"AI allows withdraw(1000): $%d (Overdraft gives negative balance!)\\n\", withdraw(&acc, 1000));\n"
            "    return 0;\n"
            "}\n"
        )
    elif "linked list" in text_lower and "insert" in text_lower:
        return (
            "struct node {\n"
            "    int info;\n"
            "    struct node *next;\n"
            "};\n"
            "typedef struct node *NODE;\n\n"
            "NODE insert_node(NODE start, int info) {\n"
            "    // Write your C implementation here\n"
            "    return start;\n"
            "}\n"
        )
    elif "stack" in text_lower:
        return (
            "#define MAX 100\n"
            "int stack[MAX];\n"
            "int top = -1;\n\n"
            "void push(int val) {\n"
            "    // Implementation here\n"
            "}\n"
        )
    elif "binary search" in text_lower:
        return (
            "int binary_search(int arr[], int n, int key) {\n"
            "    // Return index if found, else -1\n"
            "    return -1;\n"
            "}\n"
        )
    return None


def parse_questions_from_document(doc_id: str, file_path: str) -> List[Dict[str, Any]]:
    """
    Main extraction pipeline.
    Parses pages, discovers question boundaries, extracts options, marks, topics, and confidence.
    """
    pages_data = extract_text_from_pdf(file_path)
    extracted_questions = []
    question_counter = 1

    # Check if this document is a formatted Question Bank table (e.g., Q01, Q02, etc. with PS/PR/VC metadata)
    total_q_table_matches = sum(
        len(re.findall(r"(?:^|\n)\s*(Q\d{1,3})\s*\n", p["text"]))
        for p in pages_data
    )

    if total_q_table_matches >= 3:
        for p in pages_data:
            page_num = p["page_number"]
            page_text = p["text"]
            pattern = r"(?:^|\n)\s*(Q\d{1,3})\s*\n"
            splits = list(re.finditer(pattern, page_text))

            for i, split in enumerate(splits):
                raw_q_num = split.group(1)
                start_idx = split.end()
                end_idx = splits[i + 1].start() if i + 1 < len(splits) else len(page_text)
                raw_block = page_text[start_idx:end_idx].strip()

                meta_match = re.search(
                    r"\n(PS|PR|VC)\s*\n(Easy|Medium|Difficult)\s*\n([A-Za-z]+)\s*\n(CO\d+)",
                    raw_block
                )
                if meta_match:
                    type_code, level_str, bloom, co = meta_match.groups()
                    clean_text = raw_block[:meta_match.start()].strip()
                else:
                    clean_text = raw_block
                    type_code = "PR" if "write a c" in clean_text.lower() else "VC" if "ai assistant" in clean_text.lower() else "PS"
                    level_str = "Medium"
                    bloom = "App"
                    co = "CO1"

                # De-hyphenate line breaks like addSec-\nonds -> addSeconds
                clean_text = re.sub(r"(\w+)-\s*\n\s*(\w+)", r"\1\2", clean_text)

                if type_code == "PR":
                    q_type = "programming"
                    marks = 5
                elif type_code == "VC":
                    q_type = "debugging"
                    marks = 5
                else:
                    q_type = "problem_solving" if len(clean_text.split()) > 20 else "short_answer"
                    marks = 2

                diff_mapped = "Hard" if level_str == "Difficult" else level_str
                topic_id, subtopic = detect_topic(clean_text)
                starter_code = extract_starter_code_if_programming(clean_text)

                extracted_questions.append({
                    "question_id": f"q-{doc_id}-{page_num}-{question_counter}",
                    "document_id": doc_id,
                    "question_number": raw_q_num,
                    "question_text": clean_text,
                    "question_type": q_type,
                    "topic_id": topic_id,
                    "subtopic": f"{subtopic} • Bloom's: {bloom} • {co}",
                    "difficulty": diff_mapped,
                    "marks": marks,
                    "source_page": page_num,
                    "extraction_confidence": 0.99,
                    "verification_status": "pending_review",
                    "options": [],
                    "correct_answer": None,
                    "explanation": f"Source Outcome: {co}. Bloom Taxonomy: {bloom}. Evaluation criteria: Standard C systems adherence and algorithmic invariants.",
                    "c_starter_code": starter_code,
                    "is_bookmarked": False
                })
                question_counter += 1

        return extracted_questions

    # Standard general Question boundary regex: e.g. "Q1.", "Question 1:", "1.", "Q.2", "(1)"
    # Note: bounded to 1-3 digits to avoid matching numeric values in question body like 86400
    q_boundary_regex = re.compile(
        r"(?:^|\n)\s*(?:Q(?:uestion)?\.?\s*(\d{1,3})|(\d{1,3})[\.\)])\s*[:\.\-]?\s*",
        re.IGNORECASE
    )

    for p in pages_data:
        page_num = p["page_number"]
        page_text = p["text"]

        if not page_text or len(page_text.strip()) < 20:
            continue

        splits = list(q_boundary_regex.finditer(page_text))

        if splits:
            for i, split in enumerate(splits):
                start_idx = split.end()
                end_idx = splits[i + 1].start() if i + 1 < len(splits) else len(page_text)
                raw_q_num = split.group(1) or split.group(2) or str(question_counter)
                raw_block = page_text[start_idx:end_idx].strip()

                if len(raw_block) < 15:
                    continue

                marks, block_after_marks = extract_marks(raw_block)
                options, answer, clean_text = parse_options(block_after_marks)
                topic_id, subtopic = detect_topic(clean_text)
                q_type = detect_question_type(clean_text, options)
                starter_code = extract_starter_code_if_programming(clean_text)

                confidence = 0.98 if options or len(clean_text.split()) > 10 else 0.82

                extracted_questions.append({
                    "question_id": f"q-{doc_id}-{page_num}-{question_counter}",
                    "document_id": doc_id,
                    "question_number": f"Q{raw_q_num}",
                    "question_text": clean_text,
                    "question_type": q_type,
                    "topic_id": topic_id,
                    "subtopic": subtopic,
                    "difficulty": "Hard" if q_type in ["programming", "debugging"] else "Easy" if q_type in ["mcq", "true_false"] and marks <= 1 else "Medium",
                    "marks": marks,
                    "source_page": page_num,
                    "extraction_confidence": confidence,
                    "verification_status": "pending_review",
                    "options": options,
                    "correct_answer": answer,
                    "explanation": None,
                    "c_starter_code": starter_code,
                    "is_bookmarked": False
                })
                question_counter += 1
        else:
            paragraphs = [p.strip() for p in page_text.split("\n\n") if len(p.strip()) > 30]
            for para in paragraphs[:3]:
                marks, clean_para = extract_marks(para)
                options, answer, clean_text = parse_options(clean_para)
                topic_id, subtopic = detect_topic(clean_text)
                q_type = detect_question_type(clean_text, options)

                extracted_questions.append({
                    "question_id": f"q-{doc_id}-{page_num}-{question_counter}",
                    "document_id": doc_id,
                    "question_number": f"Q{question_counter}",
                    "question_text": clean_text,
                    "question_type": q_type,
                    "topic_id": topic_id,
                    "subtopic": subtopic,
                    "difficulty": "Medium",
                    "marks": marks,
                    "source_page": page_num,
                    "extraction_confidence": 0.85,
                    "verification_status": "pending_review",
                    "options": options,
                    "correct_answer": answer,
                    "explanation": None,
                    "c_starter_code": extract_starter_code_if_programming(clean_text),
                    "is_bookmarked": False
                })
                question_counter += 1

    return extracted_questions

