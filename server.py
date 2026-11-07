"""
DSVERSE - High-Performance FastAPI Backend Server.
Powers Interactive Computer Science Laboratory with C Source Line Synchronization.
"""

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os

from data_structures.linked_list import SinglyLinkedList, C_STRUCT_DEFINITION, C_CODE_SNIPPETS
from data_structures.doubly_linked_list import DoublyLinkedList
from data_structures.circular_linked_list import CircularLinkedList
from data_structures.skip_list import SkipListDS
from data_structures.array_ds import ArrayDS
from data_structures.stack_ds import StackDS
from data_structures.queue_ds import QueueDS
from data_structures.tree_ds import BST, BinaryHeapDS
from data_structures.graph_ds import GraphDS
from data_structures.hash_table_ds import HashTableDS
from algorithms.sorting_lab import run_bubble_sort, run_selection_sort, run_insertion_sort
from algorithms.searching_lab import run_linear_search, run_binary_search
from algorithms.comparison import compare_sorting_algorithms
from modules.ds_detective import get_diagnostic_cases
from database.db_manager import get_or_create_user, save_experiment, get_experiments, is_postgres_available
from code_arena.problems import get_all_problems, get_problem_by_id
from code_arena.judge import run_problem_code, submit_problem_code, compile_c_code_only, get_visual_debug_trace
from code_arena.compiler import compile_and_run_c
from code_arena.db import get_user_submissions, get_saved_solution, save_user_solution
from question_vault.router import vault_router

app = FastAPI(
    title="DSVERSE - Computer Science Visualization Platform API",
    description="REST API delivering step-by-step data structure pointer executions synchronized with C source code.",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Persistent Data Structure instances
ll = SinglyLinkedList(initial_values=[10, 20, 30, 40])
dll = DoublyLinkedList(initial_values=[10, 20, 30, 40])
cll = CircularLinkedList(initial_values=[10, 20, 30, 40])
skiplist_ds = SkipListDS()
array_ds = ArrayDS(capacity=10)
stack_ds = StackDS(capacity=8)
queue_ds = QueueDS(capacity=8)
bst_ds = BST()
heap_ds = BinaryHeapDS(is_min_heap=True)
graph_ds = GraphDS()
hash_ds = HashTableDS(table_size=7)

# Static file paths
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(os.path.join(FRONTEND_DIST, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Mount Question Vault API Router
app.include_router(vault_router)


@app.get("/")
def serve_index():
    dist_index = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(dist_index):
        return FileResponse(dist_index)
    static_index = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(static_index):
        return FileResponse(static_index)
    return {"message": "DSVERSE API is operational."}


@app.get("/favicon.svg")
def serve_favicon_svg():
    fav = os.path.join(FRONTEND_DIST, "favicon.svg")
    if os.path.exists(fav):
        return FileResponse(fav, media_type="image/svg+xml")
    pub_fav = os.path.join(os.path.dirname(__file__), "frontend", "public", "favicon.svg")
    if os.path.exists(pub_fav):
        return FileResponse(pub_fav, media_type="image/svg+xml")
    return Response(status_code=404)


@app.get("/favicon.ico")
def serve_favicon_ico():
    return serve_favicon_svg()


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "platform": "DSVERSE",
        "tagline": "Understand. Visualize. Execute. Master.",
        "database": "PostgreSQL" if is_postgres_available() else "SQLite (Local)"
    }


# =======================================================================
# 1. LINKED LIST APIS
# =======================================================================

class ValuePayload(BaseModel):
    value: int


class PositionPayload(BaseModel):
    value: int
    position: int


class DeletePositionPayload(BaseModel):
    position: int


class DeleteValuePayload(BaseModel):
    value: int


class SearchPayload(BaseModel):
    target: int


@app.get("/api/linked-list/state")
def get_current_state():
    return {
        "nodes": ll._snapshot(active_id=ll.head.id if ll.head else None),
        "head_id": ll.head.id if ll.head else None,
        "values": ll.to_values(),
        "total_nodes": ll.get_length(),
        "total_operations": ll.operation_count,
        "c_struct": C_STRUCT_DEFINITION
    }


@app.post("/api/linked-list/insert-beginning")
def insert_beginning(payload: ValuePayload):
    return ll.insert_beginning(payload.value)


@app.post("/api/linked-list/insert-end")
def insert_end(payload: ValuePayload):
    return ll.insert_end(payload.value)


@app.post("/api/linked-list/insert-position")
def insert_position(payload: PositionPayload):
    result = ll.insert_at_position(payload.value, payload.position)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.post("/api/linked-list/delete-beginning")
def delete_beginning():
    result = ll.delete_beginning()
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.post("/api/linked-list/delete-end")
def delete_end():
    result = ll.delete_end()
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.post("/api/linked-list/delete-position")
def delete_position(payload: DeletePositionPayload):
    result = ll.delete_at_position(payload.position)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.post("/api/linked-list/delete-value")
def delete_value(payload: DeleteValuePayload):
    result = ll.delete_by_value(payload.value)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.post("/api/linked-list/search")
def search(payload: SearchPayload):
    return ll.search(payload.target)


@app.post("/api/linked-list/reverse")
def reverse():
    return ll.reverse()


@app.post("/api/linked-list/find-middle")
def find_middle():
    result = ll.find_middle()
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.post("/api/linked-list/detect-cycle")
def detect_cycle():
    result = ll.detect_cycle()
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.post("/api/linked-list/reset")
def reset_list():
    return ll.reset_default()


@app.post("/api/linked-list/clear")
def clear_list():
    return ll.clear()


@app.get("/api/linked-list/c-source")
def download_c_source():
    """Generates a complete, standard ANSI C compilable file for the Singly Linked List."""
    full_c_code = (
        "/*\n"
        " * DSVERSE - Complete ANSI C Singly Linked List Implementation\n"
        " * Generated by DSVERSE Computer Science Laboratory\n"
        " * Compilable with: gcc -Wall -Wextra linked_list.c -o linked_list\n"
        " */\n\n"
        "#include <stdio.h>\n"
        "#include <stdlib.h>\n\n"
        f"{C_STRUCT_DEFINITION}\n\n"
    )
    for op_name, snippet in C_CODE_SNIPPETS.items():
        full_c_code += f"// --- Operation: {op_name} ---\n{snippet}\n\n"

    full_c_code += (
        "int main(void) {\n"
        "    NODE head = NULL;\n"
        "    printf(\"DSVERSE Linked List in C Initialized.\\n\");\n"
        "    head = insert_beginning(head, 40);\n"
        "    head = insert_beginning(head, 30);\n"
        "    head = insert_beginning(head, 20);\n"
        "    head = insert_beginning(head, 10);\n"
        "    printf(\"List created with 4 nodes.\\n\");\n"
        "    return 0;\n"
        "}\n"
    )
    return PlainTextResponse(
        content=full_c_code,
        media_type="text/x-c",
        headers={"Content-Disposition": "attachment; filename=dsverse_singly_linked_list.c"}
    )


# =======================================================================
# 1A-1. DOUBLY LINKED LIST APIS
# =======================================================================

@app.get("/api/doubly-linked-list/state")
def get_doubly_state():
    return dll.get_state()

@app.post("/api/doubly-linked-list/insert-beginning")
def dll_insert_beginning(payload: ValuePayload):
    return dll.insert_beginning(payload.value)

@app.post("/api/doubly-linked-list/insert-end")
def dll_insert_end(payload: ValuePayload):
    return dll.insert_end(payload.value)

@app.post("/api/doubly-linked-list/delete-beginning")
def dll_delete_beginning():
    return dll.delete_beginning()

@app.post("/api/doubly-linked-list/delete-end")
def dll_delete_end():
    return dll.delete_end()

@app.post("/api/doubly-linked-list/reverse")
def dll_reverse():
    return dll.reverse()

@app.post("/api/doubly-linked-list/reset")
def dll_reset():
    return dll.reset_default()


# =======================================================================
# 1A-2. CIRCULAR LINKED LIST APIS
# =======================================================================

@app.get("/api/circular-linked-list/state")
def get_circular_state():
    return cll.get_state()

@app.post("/api/circular-linked-list/insert-beginning")
def cll_insert_beginning(payload: ValuePayload):
    return cll.insert_beginning(payload.value)

@app.post("/api/circular-linked-list/insert-end")
def cll_insert_end(payload: ValuePayload):
    return cll.insert_end(payload.value)

@app.post("/api/circular-linked-list/delete-beginning")
def cll_delete_beginning():
    return cll.delete_beginning()

@app.post("/api/circular-linked-list/detect-cycle")
def cll_detect_cycle():
    return cll.detect_cycle_floyd()

@app.post("/api/circular-linked-list/reset")
def cll_reset():
    return cll.reset_default()


# =======================================================================
# 1A-3. SKIP LIST APIS
# =======================================================================

class SkipInsertPayload(BaseModel):
    key: int
    value: int

class SkipKeyPayload(BaseModel):
    key: int

@app.get("/api/skip-list/state")
def get_skip_state():
    return skiplist_ds.get_state()

@app.post("/api/skip-list/insert")
def skiplist_insert(payload: SkipInsertPayload):
    return skiplist_ds.insert(payload.key, payload.value)

@app.post("/api/skip-list/search")
def skiplist_search(payload: SkipKeyPayload):
    return skiplist_ds.search(payload.key)

@app.post("/api/skip-list/delete")
def skiplist_delete(payload: SkipKeyPayload):
    return skiplist_ds.delete(payload.key)

@app.post("/api/skip-list/reset")
def skiplist_reset():
    return skiplist_ds.reset_default()


# =======================================================================
# 1B. ARRAY APIS
# =======================================================================

class ArrayInsertPayload(BaseModel):
    index: int
    value: int

class ArrayIndexPayload(BaseModel):
    index: int

class ArrayUpdatePayload(BaseModel):
    index: int
    value: int

class ArraySearchPayload(BaseModel):
    target: int

@app.get("/api/array/state")
def get_array_state():
    return array_ds.get_state()

@app.post("/api/array/insert")
def array_insert(payload: ArrayInsertPayload):
    return array_ds.insert_at(payload.index, payload.value)

@app.post("/api/array/delete")
def array_delete(payload: ArrayIndexPayload):
    return array_ds.delete_at(payload.index)

@app.post("/api/array/update")
def array_update(payload: ArrayUpdatePayload):
    return array_ds.update_at(payload.index, payload.value)

@app.post("/api/array/search")
def array_search(payload: ArraySearchPayload):
    return array_ds.search(payload.target)

@app.post("/api/array/reverse")
def array_reverse():
    return array_ds.reverse()

@app.post("/api/array/reset")
def array_reset():
    return array_ds.reset_default()


# =======================================================================
# 1C. STACK APIS
# =======================================================================

class StackPushPayload(BaseModel):
    value: int

@app.get("/api/stack/state")
def get_stack_state():
    return stack_ds.get_state()

@app.post("/api/stack/push")
def stack_push(payload: StackPushPayload):
    return stack_ds.push(payload.value)

@app.post("/api/stack/pop")
def stack_pop():
    return stack_ds.pop()

@app.post("/api/stack/peek")
def stack_peek():
    return stack_ds.peek()

@app.post("/api/stack/reset")
def stack_reset():
    return stack_ds.reset_default()

@app.post("/api/stack/clear")
def stack_clear():
    return stack_ds.clear()


# =======================================================================
# 1D. QUEUE APIS
# =======================================================================

class QueueEnqueuePayload(BaseModel):
    value: int

@app.get("/api/queue/state")
def get_queue_state():
    return queue_ds.get_state()

@app.post("/api/queue/enqueue")
def queue_enqueue(payload: QueueEnqueuePayload):
    return queue_ds.enqueue(payload.value)

@app.post("/api/queue/dequeue")
def queue_dequeue():
    return queue_ds.dequeue()

@app.post("/api/queue/peek")
def queue_peek():
    return queue_ds.peek()

@app.post("/api/queue/reset")
def queue_reset():
    return queue_ds.reset_default()

@app.post("/api/queue/clear")
def queue_clear():
    return queue_ds.clear()


# =======================================================================
# 1E. TREE / BST & HEAP APIS
# =======================================================================

class TreeInsertPayload(BaseModel):
    value: int

class TreeSearchPayload(BaseModel):
    key: int

class TreeTraversePayload(BaseModel):
    mode: str = "inorder"

class HeapInsertPayload(BaseModel):
    value: int

@app.get("/api/tree/state")
def get_tree_state():
    return bst_ds.get_state()

@app.post("/api/tree/insert")
def tree_insert(payload: TreeInsertPayload):
    return bst_ds.insert(payload.value)

@app.post("/api/tree/search")
def tree_search(payload: TreeSearchPayload):
    return bst_ds.search(payload.key)

@app.post("/api/tree/traverse")
def tree_traverse(payload: TreeTraversePayload):
    return bst_ds.traverse(payload.mode)

@app.post("/api/tree/reset")
def tree_reset():
    return bst_ds.reset_default()

@app.get("/api/heap/state")
def get_heap_state():
    return heap_ds.get_state()

@app.post("/api/heap/insert")
def heap_insert(payload: HeapInsertPayload):
    return heap_ds.insert(payload.value)

@app.post("/api/heap/toggle-mode")
def heap_toggle():
    heap_ds.is_min_heap = not heap_ds.is_min_heap
    heap_ds.data = [10, 20, 15, 30, 40] if heap_ds.is_min_heap else [90, 70, 80, 40, 50]
    return heap_ds.get_state()


# =======================================================================
# 1F. GRAPH APIS
# =======================================================================

class GraphTraversalPayload(BaseModel):
    start_vertex: int = 0

@app.get("/api/graph/state")
def get_graph_state():
    return graph_ds.get_state()

@app.post("/api/graph/bfs")
def graph_bfs(payload: GraphTraversalPayload):
    return graph_ds.run_bfs(payload.start_vertex)

@app.post("/api/graph/dfs")
def graph_dfs(payload: GraphTraversalPayload):
    return graph_ds.run_dfs(payload.start_vertex)

@app.post("/api/graph/dijkstra")
def graph_dijkstra(payload: GraphTraversalPayload):
    return graph_ds.run_dijkstra(payload.start_vertex)

@app.post("/api/graph/reset")
def graph_reset():
    return graph_ds.reset_default()


# =======================================================================
# 1G. HASH TABLE APIS
# =======================================================================

class HashInsertPayload(BaseModel):
    key: int
    value: int

class HashSearchPayload(BaseModel):
    key: int

class HashModePayload(BaseModel):
    mode: str

@app.get("/api/hash-table/state")
def get_hash_state():
    return hash_ds.get_state()

@app.post("/api/hash-table/insert")
def hash_insert(payload: HashInsertPayload):
    return hash_ds.insert(payload.key, payload.value)

@app.post("/api/hash-table/search")
def hash_search(payload: HashSearchPayload):
    return hash_ds.search(payload.key)

@app.post("/api/hash-table/mode")
def hash_set_mode(payload: HashModePayload):
    return hash_ds.set_mode(payload.mode)

@app.post("/api/hash-table/reset")
def hash_reset():
    return hash_ds.reset_default()


# =======================================================================
# 2. ALGORITHM LAB APIS
# =======================================================================

class SortPayload(BaseModel):
    algorithm: str
    array: List[int]


class SearchAlgoPayload(BaseModel):
    algorithm: str
    array: List[int]
    key: int


class ComparePayload(BaseModel):
    algo1: str
    algo2: str
    array: List[int]


@app.post("/api/algorithms/sort")
def run_sort_algorithm(payload: SortPayload):
    algo = payload.algorithm.lower()
    arr = payload.array
    if not arr:
        arr = [45, 12, 89, 34, 23, 7, 56]

    if "bubble" in algo:
        return run_bubble_sort(arr)
    elif "selection" in algo:
        return run_selection_sort(arr)
    elif "insertion" in algo:
        return run_insertion_sort(arr)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported sorting algorithm: {algo}")


@app.post("/api/algorithms/search")
def run_search_algorithm(payload: SearchAlgoPayload):
    algo = payload.algorithm.lower()
    arr = payload.array
    key = payload.key
    if not arr:
        arr = [10, 25, 33, 47, 52, 68, 79, 91]

    if "linear" in algo:
        return run_linear_search(arr, key)
    elif "binary" in algo:
        return run_binary_search(arr, key)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported search algorithm: {algo}")


@app.post("/api/algorithms/compare")
def compare_algorithms(payload: ComparePayload):
    return compare_sorting_algorithms(payload.array, payload.algo1, payload.algo2)


# =======================================================================
# 3. DS DETECTIVE (ACADEMIC CODE ANALYSIS)
# =======================================================================

class DiagnosticCheckPayload(BaseModel):
    case_id: str
    selected_option: int


@app.get("/api/detective/cases")
def get_cases():
    return get_diagnostic_cases()


@app.post("/api/detective/verify")
def verify_diagnostic(payload: DiagnosticCheckPayload):
    cases = get_diagnostic_cases()
    matched = next((c for c in cases if c["id"] == payload.case_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail="Diagnostic case not found.")

    is_correct = (payload.selected_option == matched["correct_option"])
    return {
        "case_id": payload.case_id,
        "is_correct": is_correct,
        "academic_explanation": matched["academic_explanation"]
    }


# =======================================================================
# 4. EXPERIMENTS PERSISTENCE
# =======================================================================

class SaveExperimentPayload(BaseModel):
    username: str
    module: str
    operation: str
    input_data: str
    metrics: Dict[str, Any]


@app.get("/api/experiments")
def fetch_experiments(username: str = "scholar"):
    return get_experiments(username)


@app.post("/api/experiments/save")
def persist_experiment(payload: SaveExperimentPayload):
    save_experiment(payload.username, payload.module, payload.operation, payload.input_data, payload.metrics)
    return {"status": "saved"}


# =======================================================================
# 5. CODE ARENA API ENDPOINTS
# =======================================================================

class ArenaRunPayload(BaseModel):
    problem_id: str
    code: str
    mode: Optional[str] = "function"


class ArenaSubmitPayload(BaseModel):
    problem_id: str
    code: str
    username: Optional[str] = "scholar"


class ArenaCompilePayload(BaseModel):
    code: str


class ArenaExecuteRawPayload(BaseModel):
    code: str
    stdin: Optional[str] = ""


class ArenaSavePayload(BaseModel):
    problem_id: str
    code: str
    username: Optional[str] = "scholar"


@app.get("/api/arena/problems")
def fetch_arena_problems():
    """Returns the full catalog of practice problems."""
    return get_all_problems()


@app.get("/api/arena/problems/{problem_id}")
def fetch_arena_problem(problem_id: str):
    """Returns comprehensive details for a specific problem."""
    prob = get_problem_by_id(problem_id)
    if not prob:
        raise HTTPException(status_code=404, detail="Problem not found.")
    return prob


@app.post("/api/arena/run")
def run_arena_code(payload: ArenaRunPayload):
    """Executes code against visible sample test cases."""
    return run_problem_code(payload.problem_id, payload.code, mode=payload.mode or "function")


@app.post("/api/arena/submit")
def submit_arena_code(payload: ArenaSubmitPayload):
    """Evaluates code across all test suites, generates verdicts, and stores submission."""
    return submit_problem_code(payload.problem_id, payload.code, username=payload.username or "scholar")


@app.post("/api/arena/compile")
def compile_arena_code(payload: ArenaCompilePayload):
    """Checks C syntax and compiler warnings via GCC."""
    return compile_c_code_only(payload.code)


@app.post("/api/arena/execute-raw")
def execute_raw_c(payload: ArenaExecuteRawPayload):
    """Compiles and executes an arbitrary standalone C program for the C Online Compiler."""
    return compile_and_run_c(payload.code, stdin_input=payload.stdin or "", timeout_seconds=3.0)


@app.post("/api/arena/visualize")
def visualize_arena_execution(payload: ArenaRunPayload):
    """Generates execution trace events and memory snapshots for the live visual debugger."""
    return get_visual_debug_trace(payload.problem_id, payload.code)


@app.get("/api/arena/submissions")
def fetch_user_submissions(username: str = "scholar", problem_id: Optional[str] = None):
    """Returns history of user submissions and verdicts."""
    return get_user_submissions(username=username, problem_id=problem_id)


@app.get("/api/arena/saved-solution/{problem_id}")
def fetch_saved_solution(problem_id: str, username: str = "scholar"):
    """Fetches user's autosaved code for a problem."""
    code = get_saved_solution(username=username, problem_id=problem_id)
    return {"problem_id": problem_id, "saved_code": code}


@app.post("/api/arena/save-solution")
def persist_solution(payload: ArenaSavePayload):
    """Autosaves user code for a problem."""
    save_user_solution(username=payload.username or "scholar", problem_id=payload.problem_id, source_code=payload.code)
    return {"status": "saved"}


@app.get("/{full_path:path}")
def catch_all(full_path: str):
    """Fallback catch-all route for Single Page Application client-side routing."""
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail=f"API endpoint '/{full_path}' not found.")
    dist_index = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(dist_index):
        return FileResponse(dist_index)
    raise HTTPException(status_code=404, detail="Page not found.")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
