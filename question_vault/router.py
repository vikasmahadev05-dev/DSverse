"""
FastAPI Router for DSVERSE Question Vault.
Exposes REST endpoints for PDF management, intelligent extraction,
question bank curation, quiz runner, mock exams, and analytics.
"""

import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from question_vault.models import (
    DocumentRenameRequest,
    QuestionCreateRequest,
    QuestionUpdateRequest,
    BulkApprovalRequest,
    CreateQuizRequest,
    SubmitAnswerRequest,
    FinishQuizRequest,
    CodingSubmissionRequest
)
from question_vault.db import (
    init_vault_db,
    save_document,
    get_document,
    list_documents,
    rename_document,
    delete_document,
    update_document_status,
    save_question,
    get_question,
    update_question,
    delete_question,
    list_questions,
    toggle_bookmark,
    bulk_update_question_status,
    get_quiz_session,
    record_quiz_answer,
    complete_quiz_session,
    get_user_analytics
)
from question_vault.parser import parse_questions_from_document, extract_text_from_pdf
from question_vault.quiz_engine import generate_quiz
from question_vault.c_bridge import execute_vault_code_submission, generate_vault_trace

vault_router = APIRouter(prefix="/api/vault", tags=["Question Vault"])

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize database tables on load
init_vault_db()


# -------------------------------------------------------------
# Background PDF Extraction Task
# -------------------------------------------------------------
def process_pdf_in_background(doc_id: str, file_path: str):
    """Parses PDF and extracts questions into SQLite."""
    try:
        update_document_status(doc_id, "processing")
        extracted_questions = parse_questions_from_document(doc_id, file_path)

        for q in extracted_questions:
            save_question(q)

        # Get page count
        pages = extract_text_from_pdf(file_path)
        page_count = len(pages)

        update_document_status(
            doc_id,
            status="review_required" if extracted_questions else "approved",
            page_count=page_count,
            extracted_count=len(extracted_questions),
            approved_count=0
        )
    except Exception as e:
        print(f"[QuestionVault] PDF processing error for {doc_id}: {e}")
        update_document_status(doc_id, status="failed")


# -------------------------------------------------------------
# 1. Overview & Analytics
# -------------------------------------------------------------
@vault_router.get("/overview")
def get_vault_overview():
    analytics = get_user_analytics()
    recent_docs = list_documents()[:5]
    return {
        **analytics,
        "recent_documents": recent_docs
    }


@vault_router.get("/analytics")
def get_detailed_analytics():
    return get_user_analytics()


# -------------------------------------------------------------
# 2. Document Management & Uploads
# -------------------------------------------------------------
@vault_router.post("/documents/upload")
async def upload_pdf_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    doc_id = f"doc-{uuid.uuid4().hex[:10]}"
    safe_filename = file.filename.replace(" ", "_")
    dest_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{safe_filename}")

    # Write file to disk
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(dest_path)

    # Save document entry
    save_document({
        "document_id": doc_id,
        "user_id": "default_student",
        "filename": file.filename,
        "file_path": dest_path,
        "processing_status": "uploaded",
        "page_count": 0,
        "file_size_bytes": file_size,
        "extracted_count": 0,
        "approved_count": 0
    })

    # Dispatch extraction in background
    background_tasks.add_task(process_pdf_in_background, doc_id, dest_path)

    return {
        "success": True,
        "message": f"PDF '{file.filename}' uploaded successfully. Question extraction queued.",
        "document_id": doc_id,
        "filename": file.filename
    }


@vault_router.get("/documents")
def get_documents_list():
    return list_documents()


@vault_router.get("/documents/{doc_id}")
def get_single_document(doc_id: str):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@vault_router.patch("/documents/{doc_id}/rename")
def rename_pdf_document(doc_id: str, req: DocumentRenameRequest):
    rename_document(doc_id, req.new_filename)
    return {"success": True, "message": "Document renamed successfully."}


@vault_router.delete("/documents/{doc_id}")
def remove_pdf_document(doc_id: str):
    delete_document(doc_id)
    return {"success": True, "message": "Document deleted successfully."}


@vault_router.post("/documents/{doc_id}/reprocess")
def reprocess_pdf_document(doc_id: str, background_tasks: BackgroundTasks):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    background_tasks.add_task(process_pdf_in_background, doc_id, doc["file_path"])
    return {"success": True, "message": "Reprocessing started in background."}


# -------------------------------------------------------------
# 3. Question Bank & Review Interface
# -------------------------------------------------------------
@vault_router.get("/questions")
def get_questions_list(
    document_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    question_type: Optional[str] = None,
    verification_status: Optional[str] = None,
    search_query: Optional[str] = None,
    bookmarked_only: bool = False,
    limit: int = 100
):
    return list_questions(
        document_id=document_id,
        topic_id=topic_id,
        difficulty=difficulty,
        question_type=question_type,
        verification_status=verification_status,
        search_query=search_query,
        bookmarked_only=bookmarked_only,
        limit=limit
    )


@vault_router.post("/questions")
def create_question_entry(req: QuestionCreateRequest):
    q_data = req.dict()
    q_data["verification_status"] = "approved"
    q_id = save_question(q_data)
    return {"success": True, "question_id": q_id, "message": "Question created successfully."}


@vault_router.get("/questions/{q_id}")
def get_single_question_details(q_id: str):
    q = get_question(q_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q


@vault_router.patch("/questions/{q_id}")
def update_question_entry(q_id: str, req: QuestionUpdateRequest):
    update_question(q_id, req.dict(exclude_unset=True))
    return {"success": True, "message": "Question updated successfully."}


@vault_router.delete("/questions/{q_id}")
def delete_question_entry(q_id: str):
    delete_question(q_id)
    return {"success": True, "message": "Question deleted successfully."}


@vault_router.post("/questions/{q_id}/bookmark")
def toggle_question_bookmark(q_id: str):
    new_state = toggle_bookmark(q_id)
    return {"success": True, "is_bookmarked": new_state}


@vault_router.post("/questions/bulk-approve")
def bulk_approve_questions(req: BulkApprovalRequest):
    bulk_update_question_status(req.question_ids, req.target_status)
    return {
        "success": True,
        "message": f"{len(req.question_ids)} questions updated to '{req.target_status}'."
    }


# -------------------------------------------------------------
# 4. Interactive Quiz & Mock Examination Engine
# -------------------------------------------------------------
@vault_router.post("/quiz/generate")
def generate_quiz_session(req: CreateQuizRequest):
    quiz = generate_quiz(
        user_id="default_student",
        quiz_name=req.quiz_name,
        quiz_mode=req.quiz_mode,
        document_ids=req.document_ids,
        topics=req.topics,
        difficulties=req.difficulties,
        question_types=req.question_types,
        num_questions=req.num_questions,
        time_limit_minutes=req.time_limit_minutes,
        negative_marking=req.negative_marking
    )
    return quiz


@vault_router.get("/quiz/{quiz_id}")
def fetch_quiz_session(quiz_id: str):
    quiz = get_quiz_session(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    return quiz


@vault_router.post("/quiz/answer")
def submit_question_answer(req: SubmitAnswerRequest):
    res = record_quiz_answer(
        quiz_id=req.quiz_id,
        question_id=req.question_id,
        submitted_answer=req.submitted_answer,
        user_id="default_student",
        time_taken=req.time_taken_seconds
    )
    return res


@vault_router.post("/quiz/finish")
def finalize_quiz_session(req: FinishQuizRequest):
    results = complete_quiz_session(req.quiz_id, req.time_spent_seconds)
    return results


# -------------------------------------------------------------
# 5. C Coding Practice & Visualizer Bridge
# -------------------------------------------------------------
@vault_router.post("/code/execute")
def execute_coding_question(req: CodingSubmissionRequest):
    q = get_question(req.question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    res = execute_vault_code_submission(q, req.source_code, req.user_name, req.stdin or "")
    return res


@vault_router.post("/code/trace")
def trace_coding_question(req: CodingSubmissionRequest):
    q = get_question(req.question_id)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    trace = generate_vault_trace(q, req.source_code)
    return trace


# -------------------------------------------------------------
# 6. Revision Center
# -------------------------------------------------------------
@vault_router.get("/revision")
def get_revision_recommendations():
    analytics = get_user_analytics()
    bookmarked = list_questions(bookmarked_only=True, limit=20)
    weak_topics = analytics.get("weak_topics", [])
    return {
        "weak_topics": weak_topics,
        "bookmarked_questions": bookmarked,
        "overall_accuracy_pct": analytics.get("overall_accuracy_pct", 0)
    }

