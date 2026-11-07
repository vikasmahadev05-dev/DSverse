"""
Pydantic Schemas and Data Models for Question Vault.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Document Models
# -------------------------------------------------------------
class DocumentMetadata(BaseModel):
    document_id: str
    user_id: str = "default_student"
    filename: str
    file_path: str
    upload_date: str
    processing_status: str  # 'uploaded', 'processing', 'extraction_completed', 'review_required', 'approved', 'failed'
    page_count: int = 0
    file_size_bytes: int = 0
    extracted_count: int = 0
    approved_count: int = 0


class DocumentRenameRequest(BaseModel):
    new_filename: str


# -------------------------------------------------------------
# Option & Question Models
# -------------------------------------------------------------
class QuestionOptionModel(BaseModel):
    option_id: Optional[str] = None
    option_label: str  # 'A', 'B', 'C', 'D'
    option_text: str
    is_correct: bool = False


class QuestionModel(BaseModel):
    question_id: str
    document_id: Optional[str] = None
    question_number: str
    question_text: str
    question_type: str  # 'mcq', 'msq', 'true_false', 'fill_blanks', 'short_answer', 'long_answer', 'programming', 'code_output', 'debugging', 'algorithm_analysis'
    topic_id: str  # 'arrays', 'linked-lists', 'stacks', 'queues', 'trees', 'graphs', 'heaps', 'hash-tables', 'sorting', 'searching', 'recursion', 'time-complexity', 'c-programming', 'pointers'
    subtopic: Optional[str] = None
    difficulty: str = "Medium"  # 'Easy', 'Medium', 'Hard'
    marks: int = 1
    source_page: int = 1
    extraction_confidence: float = 0.95
    verification_status: str = "pending_review"  # 'draft', 'pending_review', 'approved', 'rejected'
    options: List[QuestionOptionModel] = []
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    c_starter_code: Optional[str] = None
    c_solution_code: Optional[str] = None
    is_bookmarked: bool = False


class QuestionCreateRequest(BaseModel):
    document_id: Optional[str] = None
    question_number: Optional[str] = "Q"
    question_text: str
    question_type: str = "mcq"
    topic_id: str = "linked-lists"
    subtopic: Optional[str] = None
    difficulty: str = "Medium"
    marks: int = 1
    source_page: int = 1
    options: List[QuestionOptionModel] = []
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    c_starter_code: Optional[str] = None


class QuestionUpdateRequest(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    topic_id: Optional[str] = None
    subtopic: Optional[str] = None
    difficulty: Optional[str] = None
    marks: Optional[int] = None
    options: Optional[List[QuestionOptionModel]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    verification_status: Optional[str] = None
    c_starter_code: Optional[str] = None


class BulkApprovalRequest(BaseModel):
    question_ids: List[str]
    target_status: str = "approved"  # 'approved' or 'rejected'


# -------------------------------------------------------------
# Quiz & Exam Models
# -------------------------------------------------------------
class CreateQuizRequest(BaseModel):
    quiz_name: str = "Practice Quiz"
    quiz_mode: str = "practice"  # 'practice', 'examination', 'revision'
    document_ids: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    difficulties: Optional[List[str]] = None
    question_types: Optional[List[str]] = None
    num_questions: int = 10
    total_marks: Optional[int] = None
    time_limit_minutes: Optional[int] = None  # None for practice, integer for exam
    negative_marking: bool = False


class SubmitAnswerRequest(BaseModel):
    quiz_id: str
    question_id: str
    submitted_answer: str
    time_taken_seconds: float = 0.0


class FinishQuizRequest(BaseModel):
    quiz_id: str
    time_spent_seconds: float = 0.0


# -------------------------------------------------------------
# Coding Practice Models
# -------------------------------------------------------------
class CodingSubmissionRequest(BaseModel):
    question_id: str
    source_code: str
    user_name: str = "scholar"
    stdin: Optional[str] = ""


# -------------------------------------------------------------
# Collection Models
# -------------------------------------------------------------
class CreateCollectionRequest(BaseModel):
    collection_name: str
    description: Optional[str] = None
    question_ids: Optional[List[str]] = None


class AddToCollectionRequest(BaseModel):
    collection_id: str
    question_ids: List[str]

