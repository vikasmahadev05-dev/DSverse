"""
Database models and queries for DSVERSE Code Arena.
Stores problem submissions, automated judge verdicts, test results, and saved solutions.
Integrates with PostgreSQL or local SQLite fallback via database/db_manager.py.
"""

import json
from typing import Dict, Any, List, Optional
from database.db_manager import get_db_connection


def init_code_arena_tables():
    """Initializes tables for Code Arena problems, submissions, and saved solutions."""
    conn, backend = get_db_connection()
    cursor = conn.cursor()

    if backend == "postgres":
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS arena_submissions (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                problem_id VARCHAR(50) NOT NULL,
                source_code TEXT NOT NULL,
                verdict VARCHAR(50) NOT NULL,
                passed_tests INT DEFAULT 0,
                total_tests INT DEFAULT 0,
                execution_time_ms REAL DEFAULT 0.0,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS arena_saved_solutions (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                problem_id VARCHAR(50) NOT NULL,
                source_code TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(username, problem_id)
            );
        """)
    else:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS arena_submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                problem_id TEXT NOT NULL,
                source_code TEXT NOT NULL,
                verdict TEXT NOT NULL,
                passed_tests INTEGER DEFAULT 0,
                total_tests INTEGER DEFAULT 0,
                execution_time_ms REAL DEFAULT 0.0,
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS arena_saved_solutions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                problem_id TEXT NOT NULL,
                source_code TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(username, problem_id)
            );
        """)

    conn.commit()
    cursor.close()
    conn.close()


def save_submission(
    username: str,
    problem_id: str,
    source_code: str,
    verdict: str,
    passed_tests: int,
    total_tests: int,
    execution_time_ms: float
) -> int:
    init_code_arena_tables()
    conn, backend = get_db_connection()
    cursor = conn.cursor()

    sub_id = -1
    if backend == "postgres":
        cursor.execute("""
            INSERT INTO arena_submissions (username, problem_id, source_code, verdict, passed_tests, total_tests, execution_time_ms)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id;
        """, (username, problem_id, source_code, verdict, passed_tests, total_tests, execution_time_ms))
        row = cursor.fetchone()
        if row:
            sub_id = row[0]
    else:
        cursor.execute("""
            INSERT INTO arena_submissions (username, problem_id, source_code, verdict, passed_tests, total_tests, execution_time_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        """, (username, problem_id, source_code, verdict, passed_tests, total_tests, execution_time_ms))
        sub_id = cursor.lastrowid

    conn.commit()
    cursor.close()
    conn.close()
    return sub_id


def get_user_submissions(username: str = "scholar", problem_id: Optional[str] = None) -> List[Dict[str, Any]]:
    init_code_arena_tables()
    conn, backend = get_db_connection()
    cursor = conn.cursor()

    if backend == "postgres":
        if problem_id:
            cursor.execute("""
                SELECT id, username, problem_id, source_code, verdict, passed_tests, total_tests, execution_time_ms, submitted_at
                FROM arena_submissions
                WHERE username = %s AND problem_id = %s
                ORDER BY submitted_at DESC LIMIT 50;
            """, (username, problem_id))
        else:
            cursor.execute("""
                SELECT id, username, problem_id, source_code, verdict, passed_tests, total_tests, execution_time_ms, submitted_at
                FROM arena_submissions
                WHERE username = %s
                ORDER BY submitted_at DESC LIMIT 50;
            """, (username,))
    else:
        if problem_id:
            cursor.execute("""
                SELECT id, username, problem_id, source_code, verdict, passed_tests, total_tests, execution_time_ms, submitted_at
                FROM arena_submissions
                WHERE username = ? AND problem_id = ?
                ORDER BY submitted_at DESC LIMIT 50;
            """, (username, problem_id))
        else:
            cursor.execute("""
                SELECT id, username, problem_id, source_code, verdict, passed_tests, total_tests, execution_time_ms, submitted_at
                FROM arena_submissions
                WHERE username = ?
                ORDER BY submitted_at DESC LIMIT 50;
            """, (username,))

    rows = cursor.fetchall()
    submissions = []
    for r in rows:
        submissions.append({
            "id": r[0],
            "username": r[1],
            "problem_id": r[2],
            "source_code": r[3],
            "verdict": r[4],
            "passed_tests": r[5],
            "total_tests": r[6],
            "execution_time_ms": r[7],
            "submitted_at": str(r[8])
        })

    cursor.close()
    conn.close()
    return submissions


def save_user_solution(username: str, problem_id: str, source_code: str):
    init_code_arena_tables()
    conn, backend = get_db_connection()
    cursor = conn.cursor()

    if backend == "postgres":
        cursor.execute("""
            INSERT INTO arena_saved_solutions (username, problem_id, source_code, updated_at)
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (username, problem_id) DO UPDATE SET source_code = EXCLUDED.source_code, updated_at = CURRENT_TIMESTAMP;
        """, (username, problem_id, source_code))
    else:
        cursor.execute("""
            INSERT INTO arena_saved_solutions (username, problem_id, source_code, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT (username, problem_id) DO UPDATE SET source_code = excluded.source_code, updated_at = CURRENT_TIMESTAMP;
        """, (username, problem_id, source_code))

    conn.commit()
    cursor.close()
    conn.close()


def get_saved_solution(username: str, problem_id: str) -> Optional[str]:
    init_code_arena_tables()
    conn, backend = get_db_connection()
    cursor = conn.cursor()

    if backend == "postgres":
        cursor.execute("""
            SELECT source_code FROM arena_saved_solutions WHERE username = %s AND problem_id = %s;
        """, (username, problem_id))
    else:
        cursor.execute("""
            SELECT source_code FROM arena_saved_solutions WHERE username = ? AND problem_id = ?;
        """, (username, problem_id))

    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row[0] if row else None

