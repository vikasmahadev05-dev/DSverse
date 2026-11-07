"""
Database persistence engine for Question Vault.
Supports SQLite by default with PostgreSQL compatibility.
Handles schema initialization, indexing, migrations, and CRUD operations.
"""

import os
import sqlite3
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "question_vault.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_vault_db():
    """Initializes all normalized tables, indexes, and initial reference data."""
    conn = get_connection()
    cur = conn.cursor()

    # 1. Documents Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        document_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        upload_date TEXT NOT NULL,
        processing_status TEXT NOT NULL,
        page_count INTEGER DEFAULT 0,
        file_size_bytes INTEGER DEFAULT 0,
        extracted_count INTEGER DEFAULT 0,
        approved_count INTEGER DEFAULT 0
    )
    """)

    # 2. Questions Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        question_id TEXT PRIMARY KEY,
        document_id TEXT,
        question_number TEXT,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        subtopic TEXT,
        difficulty TEXT NOT NULL,
        marks INTEGER DEFAULT 1,
        source_page INTEGER DEFAULT 1,
        extraction_confidence REAL DEFAULT 0.95,
        verification_status TEXT NOT NULL,
        correct_answer TEXT,
        explanation TEXT,
        c_starter_code TEXT,
        c_solution_code TEXT,
        c_test_harness TEXT,
        is_bookmarked INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
    )
    """)

    # 3. Question Options Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS question_options (
        option_id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL,
        option_label TEXT NOT NULL,
        option_text TEXT NOT NULL,
        is_correct INTEGER DEFAULT 0,
        FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
    )
    """)

    # 4. Question Explanations Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS question_explanations (
        explanation_id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL,
        explanation_text TEXT NOT NULL,
        explanation_source TEXT NOT NULL,
        FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
    )
    """)

    # 5. Question Attempts Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS question_attempts (
        attempt_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        quiz_id TEXT,
        submitted_answer TEXT,
        is_correct INTEGER NOT NULL,
        time_taken_seconds REAL DEFAULT 0.0,
        attempted_at TEXT NOT NULL,
        c_code_submitted TEXT,
        c_verdict TEXT,
        FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
    )
    """)

    # 6. Quiz Sessions Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS quiz_sessions (
        quiz_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        quiz_name TEXT NOT NULL,
        quiz_mode TEXT NOT NULL,
        total_questions INTEGER DEFAULT 0,
        score REAL DEFAULT 0.0,
        total_marks INTEGER DEFAULT 0,
        time_limit_minutes INTEGER,
        time_spent_seconds REAL DEFAULT 0.0,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        status TEXT NOT NULL
    )
    """)

    # 7. Quiz Questions Mapping Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS quiz_questions (
        quiz_question_id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        display_order INTEGER NOT NULL,
        user_answer TEXT,
        is_correct INTEGER,
        is_marked_for_review INTEGER DEFAULT 0,
        is_visited INTEGER DEFAULT 0,
        FOREIGN KEY (quiz_id) REFERENCES quiz_sessions(quiz_id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
    )
    """)

    # 8. Collections Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS collections (
        collection_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        collection_name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 9. Collection Questions Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS collection_questions (
        collection_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        PRIMARY KEY (collection_id, question_id),
        FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
    )
    """)

    # 10. Saved Solutions Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS saved_solutions (
        solution_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        source_code TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
    )
    """)

    # Performance Indexes
    cur.execute("CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_questions_doc ON questions(document_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(verification_status)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_attempts_user ON question_attempts(user_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_sessions(user_id)")

    conn.commit()
    conn.close()

    # Pre-seed initial university examination questions if empty
    seed_initial_questions_if_empty()


# -------------------------------------------------------------
# Document Operations
# -------------------------------------------------------------
def save_document(doc_data: Dict[str, Any]) -> str:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO documents (
        document_id, user_id, filename, file_path, upload_date,
        processing_status, page_count, file_size_bytes, extracted_count, approved_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        doc_data["document_id"],
        doc_data.get("user_id", "default_student"),
        doc_data["filename"],
        doc_data["file_path"],
        doc_data.get("upload_date", datetime.utcnow().isoformat()),
        doc_data.get("processing_status", "uploaded"),
        doc_data.get("page_count", 0),
        doc_data.get("file_size_bytes", 0),
        doc_data.get("extracted_count", 0),
        doc_data.get("approved_count", 0)
    ))
    conn.commit()
    conn.close()
    return doc_data["document_id"]


def get_document(doc_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM documents WHERE document_id = ?", (doc_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def list_documents(user_id: str = "default_student") -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM documents WHERE user_id = ? ORDER BY upload_date DESC", (user_id,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_document_status(doc_id: str, status: str, page_count: Optional[int] = None,
                           extracted_count: Optional[int] = None, approved_count: Optional[int] = None):
    conn = get_connection()
    cur = conn.cursor()
    updates = ["processing_status = ?"]
    params = [status]
    if page_count is not None:
        updates.append("page_count = ?")
        params.append(page_count)
    if extracted_count is not None:
        updates.append("extracted_count = ?")
        params.append(extracted_count)
    if approved_count is not None:
        updates.append("approved_count = ?")
        params.append(approved_count)
    params.append(doc_id)
    cur.execute(f"UPDATE documents SET {', '.join(updates)} WHERE document_id = ?", params)
    conn.commit()
    conn.close()


def rename_document(doc_id: str, new_filename: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE documents SET filename = ? WHERE document_id = ?", (new_filename, doc_id))
    conn.commit()
    conn.close()


def delete_document(doc_id: str):
    conn = get_connection()
    cur = conn.cursor()
    # Fetch file path to delete local file if exists
    cur.execute("SELECT file_path FROM documents WHERE document_id = ?", (doc_id,))
    row = cur.fetchone()
    if row and row["file_path"] and os.path.exists(row["file_path"]):
        try:
            os.remove(row["file_path"])
        except Exception:
            pass
    # Clean up related records in cascading order
    cur.execute("DELETE FROM question_options WHERE question_id IN (SELECT question_id FROM questions WHERE document_id = ?)", (doc_id,))
    cur.execute("DELETE FROM saved_solutions WHERE question_id IN (SELECT question_id FROM questions WHERE document_id = ?)", (doc_id,))
    cur.execute("DELETE FROM questions WHERE document_id = ?", (doc_id,))
    cur.execute("DELETE FROM documents WHERE document_id = ?", (doc_id,))
    conn.commit()
    conn.close()


# -------------------------------------------------------------
# Question Operations
# -------------------------------------------------------------
def save_question(q_data: Dict[str, Any]) -> str:
    conn = get_connection()
    cur = conn.cursor()
    q_id = q_data.get("question_id") or f"q-{uuid.uuid4().hex[:10]}"
    cur.execute("""
    INSERT OR REPLACE INTO questions (
        question_id, document_id, question_number, question_text, question_type,
        topic_id, subtopic, difficulty, marks, source_page, extraction_confidence,
        verification_status, correct_answer, explanation, c_starter_code,
        c_solution_code, c_test_harness, is_bookmarked, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        q_id,
        q_data.get("document_id"),
        q_data.get("question_number", "Q"),
        q_data["question_text"],
        q_data.get("question_type", "mcq"),
        q_data.get("topic_id", "linked-lists"),
        q_data.get("subtopic"),
        q_data.get("difficulty", "Medium"),
        q_data.get("marks", 1),
        q_data.get("source_page", 1),
        q_data.get("extraction_confidence", 0.95),
        q_data.get("verification_status", "pending_review"),
        q_data.get("correct_answer"),
        q_data.get("explanation"),
        q_data.get("c_starter_code"),
        q_data.get("c_solution_code"),
        q_data.get("c_test_harness"),
        1 if q_data.get("is_bookmarked") else 0,
        datetime.utcnow().isoformat()
    ))

    # Save options if provided
    cur.execute("DELETE FROM question_options WHERE question_id = ?", (q_id,))
    if "options" in q_data and q_data["options"]:
        for opt in q_data["options"]:
            opt_id = opt.get("option_id") or f"opt-{uuid.uuid4().hex[:8]}"
            cur.execute("""
            INSERT INTO question_options (option_id, question_id, option_label, option_text, is_correct)
            VALUES (?, ?, ?, ?, ?)
            """, (
                opt_id,
                q_id,
                opt.get("option_label", "A"),
                opt.get("option_text", ""),
                1 if opt.get("is_correct") else 0
            ))

    conn.commit()
    conn.close()
    return q_id


def get_question(q_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM questions WHERE question_id = ?", (q_id,))
    q_row = cur.fetchone()
    if not q_row:
        conn.close()
        return None

    q = dict(q_row)
    cur.execute("SELECT * FROM question_options WHERE question_id = ? ORDER BY option_label ASC", (q_id,))
    q["options"] = [dict(opt) for opt in cur.fetchall()]
    conn.close()
    return q


def update_question(q_id: str, fields: Dict[str, Any]):
    conn = get_connection()
    cur = conn.cursor()
    allowed = [
        "question_text", "question_type", "topic_id", "subtopic", "difficulty",
        "marks", "source_page", "verification_status", "correct_answer",
        "explanation", "c_starter_code", "is_bookmarked"
    ]
    updates = []
    params = []
    for k, v in fields.items():
        if k in allowed:
            updates.append(f"{k} = ?")
            params.append(1 if (k == "is_bookmarked" and v is True) else 0 if (k == "is_bookmarked" and v is False) else v)

    if updates:
        params.append(q_id)
        cur.execute(f"UPDATE questions SET {', '.join(updates)} WHERE question_id = ?", params)

    if "options" in fields and fields["options"] is not None:
        cur.execute("DELETE FROM question_options WHERE question_id = ?", (q_id,))
        for opt in fields["options"]:
            opt_id = opt.get("option_id") or f"opt-{uuid.uuid4().hex[:8]}"
            cur.execute("""
            INSERT INTO question_options (option_id, question_id, option_label, option_text, is_correct)
            VALUES (?, ?, ?, ?, ?)
            """, (
                opt_id,
                q_id,
                opt.get("option_label", "A"),
                opt.get("option_text", ""),
                1 if opt.get("is_correct") else 0
            ))

    conn.commit()
    conn.close()


def delete_question(q_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM questions WHERE question_id = ?", (q_id,))
    conn.commit()
    conn.close()


def bulk_update_question_status(question_ids: List[str], target_status: str):
    conn = get_connection()
    cur = conn.cursor()
    placeholders = ",".join("?" for _ in question_ids)
    cur.execute(f"UPDATE questions SET verification_status = ? WHERE question_id IN ({placeholders})",
                [target_status] + question_ids)
    conn.commit()
    conn.close()


def list_questions(
    document_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    question_type: Optional[str] = None,
    verification_status: Optional[str] = None,
    search_query: Optional[str] = None,
    bookmarked_only: bool = False,
    limit: int = 100
) -> List[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()

    conditions = []
    params = []

    if document_id:
        conditions.append("q.document_id = ?")
        params.append(document_id)
    if topic_id:
        conditions.append("q.topic_id = ?")
        params.append(topic_id)
    if difficulty:
        conditions.append("q.difficulty = ?")
        params.append(difficulty)
    if question_type:
        conditions.append("q.question_type = ?")
        params.append(question_type)
    if verification_status:
        conditions.append("q.verification_status = ?")
        params.append(verification_status)
    if bookmarked_only:
        conditions.append("q.is_bookmarked = 1")
    if search_query:
        conditions.append("(q.question_text LIKE ? OR q.question_number LIKE ?)")
        params.extend([f"%{search_query}%", f"%{search_query}%"])

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    query = f"SELECT q.*, d.filename as document_name FROM questions q LEFT JOIN documents d ON q.document_id = d.document_id {where_clause} ORDER BY q.source_page ASC, q.question_id ASC LIMIT ?"
    params.append(limit)

    cur.execute(query, params)
    rows = cur.fetchall()

    questions = []
    for r in rows:
        q = dict(r)
        cur.execute("SELECT * FROM question_options WHERE question_id = ? ORDER BY option_label ASC", (q["question_id"],))
        q["options"] = [dict(opt) for opt in cur.fetchall()]
        questions.append(q)

    conn.close()
    return questions


def toggle_bookmark(q_id: str) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT is_bookmarked FROM questions WHERE question_id = ?", (q_id,))
    row = cur.fetchone()
    new_state = 1 if not (row and row["is_bookmarked"]) else 0
    cur.execute("UPDATE questions SET is_bookmarked = ? WHERE question_id = ?", (new_state, q_id))
    conn.commit()
    conn.close()
    return bool(new_state)


# -------------------------------------------------------------
# Quiz & Mock Exam Sessions
# -------------------------------------------------------------
def create_quiz_session(quiz_data: Dict[str, Any], question_ids: List[str]) -> Dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()
    quiz_id = f"quiz-{uuid.uuid4().hex[:10]}"
    cur.execute("""
    INSERT INTO quiz_sessions (
        quiz_id, user_id, quiz_name, quiz_mode, total_questions,
        score, total_marks, time_limit_minutes, time_spent_seconds,
        started_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        quiz_id,
        quiz_data.get("user_id", "default_student"),
        quiz_data.get("quiz_name", "Practice Quiz"),
        quiz_data.get("quiz_mode", "practice"),
        len(question_ids),
        0.0,
        quiz_data.get("total_marks", len(question_ids)),
        quiz_data.get("time_limit_minutes"),
        0.0,
        datetime.utcnow().isoformat(),
        "in_progress"
    ))

    # Link questions
    for order, q_id in enumerate(question_ids, start=1):
        cur.execute("""
        INSERT INTO quiz_questions (quiz_question_id, quiz_id, question_id, display_order)
        VALUES (?, ?, ?, ?)
        """, (f"qq-{uuid.uuid4().hex[:8]}", quiz_id, q_id, order))

    conn.commit()
    conn.close()
    return get_quiz_session(quiz_id)


def get_quiz_session(quiz_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM quiz_sessions WHERE quiz_id = ?", (quiz_id,))
    session = cur.fetchone()
    if not session:
        conn.close()
        return None

    res = dict(session)
    cur.execute("""
    SELECT qq.*, q.question_number, q.question_text, q.question_type, q.topic_id,
           q.difficulty, q.marks, q.correct_answer, q.explanation, q.c_starter_code, q.is_bookmarked
    FROM quiz_questions qq
    JOIN questions q ON qq.question_id = q.question_id
    WHERE qq.quiz_id = ?
    ORDER BY qq.display_order ASC
    """, (quiz_id,))
    questions = []
    for r in cur.fetchall():
        q_dict = dict(r)
        cur.execute("SELECT * FROM question_options WHERE question_id = ? ORDER BY option_label ASC", (q_dict["question_id"],))
        q_dict["options"] = [dict(opt) for opt in cur.fetchall()]
        questions.append(q_dict)

    res["questions"] = questions
    conn.close()
    return res


def record_quiz_answer(quiz_id: str, question_id: str, submitted_answer: str,
                       user_id: str = "default_student", time_taken: float = 0.0) -> Dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()

    # Check correct answer
    cur.execute("SELECT correct_answer, marks FROM questions WHERE question_id = ?", (question_id,))
    q_row = cur.fetchone()
    is_correct = False
    if q_row and q_row["correct_answer"]:
        clean_expected = str(q_row["correct_answer"]).strip().upper()
        clean_user = str(submitted_answer).strip().upper()
        is_correct = (clean_expected == clean_user)

    # Update quiz_questions table
    cur.execute("""
    UPDATE quiz_questions
    SET user_answer = ?, is_correct = ?, is_visited = 1
    WHERE quiz_id = ? AND question_id = ?
    """, (submitted_answer, 1 if is_correct else 0, quiz_id, question_id))

    # Record in question_attempts
    attempt_id = f"att-{uuid.uuid4().hex[:10]}"
    cur.execute("""
    INSERT INTO question_attempts (
        attempt_id, user_id, question_id, quiz_id, submitted_answer,
        is_correct, time_taken_seconds, attempted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        attempt_id,
        user_id,
        question_id,
        quiz_id,
        submitted_answer,
        1 if is_correct else 0,
        time_taken,
        datetime.utcnow().isoformat()
    ))

    conn.commit()
    conn.close()
    return {"question_id": question_id, "is_correct": is_correct, "submitted_answer": submitted_answer}


def complete_quiz_session(quiz_id: str, time_spent_seconds: float = 0.0) -> Dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()

    # Calculate score
    cur.execute("""
    SELECT qq.is_correct, q.marks
    FROM quiz_questions qq
    JOIN questions q ON qq.question_id = q.question_id
    WHERE qq.quiz_id = ?
    """, (quiz_id,))
    rows = cur.fetchall()

    correct_count = sum(1 for r in rows if r["is_correct"] == 1)
    total_count = len(rows)
    total_marks = sum(r["marks"] or 1 for r in rows)
    score = sum(r["marks"] or 1 for r in rows if r["is_correct"] == 1)

    cur.execute("""
    UPDATE quiz_sessions
    SET score = ?, completed_at = ?, time_spent_seconds = ?, status = 'completed'
    WHERE quiz_id = ?
    """, (score, datetime.utcnow().isoformat(), time_spent_seconds, quiz_id))

    conn.commit()
    conn.close()

    result = get_quiz_session(quiz_id)
    if result:
        result["correct_count"] = correct_count
        result["total_count"] = total_count
        result["score"] = score
        result["total_marks"] = total_marks
        result["accuracy_pct"] = round((correct_count / total_count * 100), 1) if total_count > 0 else 0
    return result or {}


# -------------------------------------------------------------
# Analytics & Performance Metrics
# -------------------------------------------------------------
def get_user_analytics(user_id: str = "default_student") -> Dict[str, Any]:
    conn = get_connection()
    cur = conn.cursor()

    # Total questions & documents
    cur.execute("SELECT COUNT(*) as total_docs FROM documents WHERE user_id = ?", (user_id,))
    total_docs = cur.fetchone()["total_docs"]

    cur.execute("SELECT COUNT(*) as total_q FROM questions WHERE verification_status = 'approved'")
    total_approved_q = cur.fetchone()["total_q"]

    cur.execute("SELECT COUNT(*) as pending_q FROM questions WHERE verification_status = 'pending_review'")
    pending_review_q = cur.fetchone()["pending_q"]

    # Attempts breakdown
    cur.execute("""
    SELECT COUNT(*) as total_attempts,
           SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts
    FROM question_attempts
    WHERE user_id = ?
    """, (user_id,))
    att_row = cur.fetchone()
    total_attempts = att_row["total_attempts"] or 0
    correct_attempts = att_row["correct_attempts"] or 0
    accuracy_pct = round((correct_attempts / total_attempts * 100), 1) if total_attempts > 0 else 0.0

    # Topic-wise accuracy
    cur.execute("""
    SELECT q.topic_id,
           COUNT(qa.attempt_id) as total_attempts,
           SUM(CASE WHEN qa.is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts
    FROM question_attempts qa
    JOIN questions q ON qa.question_id = q.question_id
    WHERE qa.user_id = ?
    GROUP BY q.topic_id
    """, (user_id,))
    topic_breakdown = []
    weak_topics = []
    for r in cur.fetchall():
        t_total = r["total_attempts"]
        t_correct = r["correct_attempts"]
        t_pct = round((t_correct / t_total * 100), 1) if t_total > 0 else 0.0
        topic_name = r["topic_id"].replace("-", " ").title()
        topic_breakdown.append({
            "topic_id": r["topic_id"],
            "topic_name": topic_name,
            "total_attempts": t_total,
            "correct_attempts": t_correct,
            "accuracy_pct": t_pct
        })
        if t_pct < 65.0:
            weak_topics.append({
                "topic_id": r["topic_id"],
                "topic_name": topic_name,
                "accuracy_pct": t_pct,
                "recommendation": f"Focus review on {topic_name}: practice standard pointer edge cases and exercises."
            })

    # Recent quiz history
    cur.execute("""
    SELECT quiz_id, quiz_name, quiz_mode, total_questions, score, total_marks,
           started_at, completed_at, status
    FROM quiz_sessions
    WHERE user_id = ?
    ORDER BY started_at DESC
    LIMIT 6
    """, (user_id,))
    recent_quizzes = [dict(r) for r in cur.fetchall()]

    conn.close()

    return {
        "total_documents": total_docs,
        "total_questions": total_approved_q,
        "pending_reviews": pending_review_q,
        "total_attempts": total_attempts,
        "correct_attempts": correct_attempts,
        "incorrect_attempts": total_attempts - correct_attempts,
        "overall_accuracy_pct": accuracy_pct,
        "topic_breakdown": topic_breakdown,
        "weak_topics": weak_topics,
        "recent_quizzes": recent_quizzes
    }


# -------------------------------------------------------------
# Initial Seeding of High-Quality Questions
# -------------------------------------------------------------
def seed_initial_questions_if_empty():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as cnt FROM questions")
    count = cur.fetchone()["cnt"]
    conn.close()

    if count > 0:
        return

    # Seed initial sample document
    sample_doc_id = "doc-university-exam-2024"
    save_document({
        "document_id": sample_doc_id,
        "user_id": "default_student",
        "filename": "CS201_Data_Structures_Final_Examination.pdf",
        "file_path": "uploads/CS201_Data_Structures_Final_Examination.pdf",
        "upload_date": datetime.utcnow().isoformat(),
        "processing_status": "approved",
        "page_count": 8,
        "file_size_bytes": 482910,
        "extracted_count": 8,
        "approved_count": 8
    })

    # Comprehensive Initial Questions
    sample_questions = [
        {
            "document_id": sample_doc_id,
            "question_number": "Q1",
            "question_text": "What is the time complexity of inserting a node at the beginning of a singly linked list with n nodes, given a pointer to the head node?",
            "question_type": "mcq",
            "topic_id": "linked-lists",
            "subtopic": "Singly Linked List",
            "difficulty": "Easy",
            "marks": 1,
            "source_page": 1,
            "extraction_confidence": 0.99,
            "verification_status": "approved",
            "correct_answer": "A",
            "explanation": "Inserting at the beginning requires allocating memory, setting new_node->next = head, and updating head = new_node. None of these operations depend on n, resulting in strictly O(1) constant time.",
            "options": [
                {"option_label": "A", "option_text": "O(1)", "is_correct": True},
                {"option_label": "B", "option_text": "O(n)", "is_correct": False},
                {"option_label": "C", "option_text": "O(log n)", "is_correct": False},
                {"option_label": "D", "option_text": "O(n log n)", "is_correct": False}
            ]
        },
        {
            "document_id": sample_doc_id,
            "question_number": "Q2",
            "question_text": "In a circular singly linked list, which pointer relationship uniquely identifies the last node (tail) of the list?",
            "question_type": "mcq",
            "topic_id": "linked-lists",
            "subtopic": "Circular Linked List",
            "difficulty": "Medium",
            "marks": 2,
            "source_page": 2,
            "extraction_confidence": 0.98,
            "verification_status": "approved",
            "correct_answer": "B",
            "explanation": "In a circular singly linked list, the tail node's next pointer loops back directly to the head node (tail->next == head) instead of terminating at NULL.",
            "options": [
                {"option_label": "A", "option_text": "tail->next == NULL", "is_correct": False},
                {"option_label": "B", "option_text": "tail->next == head", "is_correct": True},
                {"option_label": "C", "option_text": "tail->prev == head", "is_correct": False},
                {"option_label": "D", "option_text": "head->next == tail", "is_correct": False}
            ]
        },
        {
            "document_id": sample_doc_id,
            "question_number": "Q3",
            "question_text": "Write a C function `NODE insert_beginning(NODE start, int info)` that dynamically allocates a new node with data `info` and prepends it to the singly linked list `start`.",
            "question_type": "programming",
            "topic_id": "linked-lists",
            "subtopic": "Pointer Manipulation",
            "difficulty": "Easy",
            "marks": 5,
            "source_page": 3,
            "extraction_confidence": 0.96,
            "verification_status": "approved",
            "c_starter_code": (
                "struct node {\n"
                "    int info;\n"
                "    struct node *next;\n"
                "};\n"
                "typedef struct node *NODE;\n\n"
                "NODE insert_beginning(NODE start, int info) {\n"
                "    // User writes implementation here\n"
                "    NODE temp = (NODE)malloc(sizeof(struct node));\n"
                "    if (!temp) return start;\n"
                "    temp->info = info;\n"
                "    temp->next = start;\n"
                "    return temp;\n"
                "}\n"
            ),
            "explanation": "Allocate memory using malloc, assign info, set temp->next to the current start pointer, and return temp as the updated head.",
            "options": []
        },
        {
            "document_id": sample_doc_id,
            "question_number": "Q4",
            "question_text": "Consider the following C function:\nvoid mystery(struct node* head) {\n    if (head == NULL) return;\n    mystery(head->next);\n    printf(\"%d \", head->data);\n}\nWhat does this function print for list 10 -> 20 -> 30 -> NULL?",
            "question_type": "code_output",
            "topic_id": "recursion",
            "subtopic": "Recursive Traversal",
            "difficulty": "Medium",
            "marks": 2,
            "source_page": 4,
            "extraction_confidence": 0.97,
            "verification_status": "approved",
            "correct_answer": "C",
            "explanation": "The recursive call occurs before printf, so the call stack unwinds in reverse (LIFO) order, printing the linked list in reverse: 30 20 10.",
            "options": [
                {"option_label": "A", "option_text": "10 20 30", "is_correct": False},
                {"option_label": "B", "option_text": "10", "is_correct": False},
                {"option_label": "C", "option_text": "30 20 10", "is_correct": True},
                {"option_label": "D", "option_text": "Infinite recursion runtime error", "is_correct": False}
            ]
        },
        {
            "document_id": sample_doc_id,
            "question_number": "Q5",
            "question_text": "Which of the following data structures is most suitable for evaluating arithmetic postfix expressions?",
            "question_type": "mcq",
            "topic_id": "stacks",
            "subtopic": "Expression Evaluation",
            "difficulty": "Easy",
            "marks": 1,
            "source_page": 5,
            "extraction_confidence": 0.99,
            "verification_status": "approved",
            "correct_answer": "B",
            "explanation": "A stack is used because operands are pushed when encountered, and when an operator arrives, the top two operands are popped, evaluated, and the result is pushed back.",
            "options": [
                {"option_label": "A", "option_text": "Queue", "is_correct": False},
                {"option_label": "B", "option_text": "Stack", "is_correct": True},
                {"option_label": "C", "option_text": "Binary Heap", "is_correct": False},
                {"option_label": "D", "option_text": "Hash Table", "is_correct": False}
            ]
        },
        {
            "document_id": sample_doc_id,
            "question_number": "Q6",
            "question_text": "In a binary search tree (BST) with n elements, what is the worst-case time complexity of searching for a key?",
            "question_type": "mcq",
            "topic_id": "trees",
            "subtopic": "BST Search",
            "difficulty": "Medium",
            "marks": 2,
            "source_page": 6,
            "extraction_confidence": 0.98,
            "verification_status": "approved",
            "correct_answer": "C",
            "explanation": "In a skewed binary search tree (e.g. elements inserted in sorted ascending order), the tree degenerates into a singly linked list of height n, making search O(n) in the worst case.",
            "options": [
                {"option_label": "A", "option_text": "O(1)", "is_correct": False},
                {"option_label": "B", "option_text": "O(log n)", "is_correct": False},
                {"option_label": "C", "option_text": "O(n)", "is_correct": True},
                {"option_label": "D", "option_text": "O(n log n)", "is_correct": False}
            ]
        },
        {
            "document_id": sample_doc_id,
            "question_number": "Q7",
            "question_text": "True or False: In a Min-Heap, the root node always contains the minimum element of the entire heap.",
            "question_type": "true_false",
            "topic_id": "heaps",
            "subtopic": "Heap Invariant",
            "difficulty": "Easy",
            "marks": 1,
            "source_page": 7,
            "extraction_confidence": 0.99,
            "verification_status": "approved",
            "correct_answer": "True",
            "explanation": "By definition of the Min-Heap property, every parent node is less than or equal to its children, ensuring the absolute minimum element resides at the root index 0.",
            "options": [
                {"option_label": "True", "option_text": "True", "is_correct": True},
                {"option_label": "False", "option_text": "False", "is_correct": False}
            ]
        },
        {
            "document_id": sample_doc_id,
            "question_number": "Q8",
            "question_text": "Which graph traversal algorithm uses a FIFO Queue to visit vertices level by level?",
            "question_type": "mcq",
            "topic_id": "graphs",
            "subtopic": "Graph Traversals",
            "difficulty": "Easy",
            "marks": 1,
            "source_page": 8,
            "extraction_confidence": 0.99,
            "verification_status": "approved",
            "correct_answer": "A",
            "explanation": "Breadth-First Search (BFS) explores vertices in concentric distance layers using a First-In-First-Out (FIFO) queue, whereas Depth-First Search (DFS) uses a stack or recursion.",
            "options": [
                {"option_label": "A", "option_text": "Breadth-First Search (BFS)", "is_correct": True},
                {"option_label": "B", "option_text": "Depth-First Search (DFS)", "is_correct": False},
                {"option_label": "C", "option_text": "Dijkstra's Algorithm", "is_correct": False},
                {"option_label": "D", "option_text": "Kruskal's Algorithm", "is_correct": False}
            ]
        }
    ]

    for q in sample_questions:
        save_question(q)

