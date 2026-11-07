"""
Quiz & Mock Examination Engine for Question Vault.
Powers Practice Mode (instant feedback), Examination Mode (timed simulator),
and Revision Mode (targeting weak spots and bookmarks).
"""

import random
from typing import Dict, Any, List, Optional
from question_vault.db import (
    list_questions,
    create_quiz_session,
    get_quiz_session,
    record_quiz_answer,
    complete_quiz_session,
    get_connection
)


def generate_quiz(
    user_id: str = "default_student",
    quiz_name: str = "Interactive Quiz",
    quiz_mode: str = "practice",
    document_ids: Optional[List[str]] = None,
    topics: Optional[List[str]] = None,
    difficulties: Optional[List[str]] = None,
    question_types: Optional[List[str]] = None,
    num_questions: int = 10,
    time_limit_minutes: Optional[int] = None,
    negative_marking: bool = False
) -> Dict[str, Any]:
    """
    Selects questions matching criteria and instantiates a quiz session.
    """
    conn = get_connection()
    cur = conn.cursor()

    conditions = ["verification_status = 'approved'"]
    params = []

    if document_ids:
        placeholders = ",".join("?" for _ in document_ids)
        conditions.append(f"document_id IN ({placeholders})")
        params.extend(document_ids)

    if topics:
        placeholders = ",".join("?" for _ in topics)
        conditions.append(f"topic_id IN ({placeholders})")
        params.extend(topics)

    if difficulties:
        placeholders = ",".join("?" for _ in difficulties)
        conditions.append(f"difficulty IN ({placeholders})")
        params.extend(difficulties)

    if question_types:
        placeholders = ",".join("?" for _ in question_types)
        conditions.append(f"question_type IN ({placeholders})")
        params.extend(question_types)

    # In Revision Mode: prioritize previously incorrect or bookmarked questions
    if quiz_mode == "revision":
        query = f"""
        SELECT q.question_id
        FROM questions q
        LEFT JOIN (
            SELECT question_id, MAX(is_correct) as ever_correct
            FROM question_attempts
            WHERE user_id = ?
            GROUP BY question_id
        ) qa ON q.question_id = qa.question_id
        WHERE {' AND '.join(conditions)}
        ORDER BY (CASE WHEN q.is_bookmarked = 1 THEN 0 WHEN qa.ever_correct = 0 THEN 1 ELSE 2 END) ASC, RANDOM()
        LIMIT ?
        """
        params = [user_id] + params + [num_questions]
    else:
        query = f"""
        SELECT question_id
        FROM questions
        WHERE {' AND '.join(conditions)}
        ORDER BY RANDOM()
        LIMIT ?
        """
        params.append(num_questions)

    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    question_ids = [r["question_id"] for r in rows]

    # If too few questions with exact filters, backfill from general approved questions
    if len(question_ids) < num_questions:
        all_approved = list_questions(verification_status="approved", limit=num_questions * 2)
        for q in all_approved:
            if q["question_id"] not in question_ids:
                question_ids.append(q["question_id"])
            if len(question_ids) >= num_questions:
                break

    # If time limit not provided for exam, calculate sensible default (1.5 min per question)
    if quiz_mode == "examination" and not time_limit_minutes:
        time_limit_minutes = max(10, len(question_ids) * 2)

    quiz_data = {
        "user_id": user_id,
        "quiz_name": quiz_name,
        "quiz_mode": quiz_mode,
        "time_limit_minutes": time_limit_minutes,
        "total_marks": len(question_ids)
    }

    return create_quiz_session(quiz_data, question_ids)

