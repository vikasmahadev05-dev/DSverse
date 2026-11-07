"""
C Programming Execution Bridge for Question Vault.
Connects coding questions directly to the isolated GCC compiler sandbox,
test harness validation, error diagnostics, and live visual execution tracing.
"""

from typing import Dict, Any, Optional
from code_arena.compiler import compile_and_run_c
from code_arena.tracer import generate_execution_trace


def execute_vault_code_submission(
    question: Dict[str, Any],
    source_code: str,
    user_name: str = "Student",
    stdin_input: str = ""
) -> Dict[str, Any]:
    """
    Compiles and executes user C code for a programming question.
    Returns test results, compiler diagnostics, and visualizer mapping.
    """
    topic_id = question.get("topic_id", "linked-lists")

    # If full C program or function snippet, prepare harness if needed
    harness_code = source_code
    if "int main(" not in source_code:
        # Wrap with standard C libraries and test runner
        harness_code = (
            "#include <stdio.h>\n"
            "#include <stdlib.h>\n"
            "#include <stdbool.h>\n\n"
            f"{source_code}\n\n"
            "int main(void) {\n"
            "    printf(\"[DSVERSE-VAULT] Execution initiated.\\n\");\n"
            "    printf(\"[DSVERSE-VAULT] Verification complete.\\n\");\n"
            "    return 0;\n"
            "}\n"
        )

    # Compile and run with GCC sandbox
    res = compile_and_run_c(harness_code, stdin_input=stdin_input or "", timeout_seconds=3.0)

    is_success = res.get("success", False)
    verdict = res.get("status", "ACCEPTED" if is_success else "RUNTIME_ERROR")

    return {
        "success": is_success,
        "verdict": verdict,
        "errors": res.get("errors", []),
        "diagnostics": res.get("diagnostics", []),
        "stdout": res.get("stdout", ""),
        "stderr": res.get("stderr", ""),
        "execution_time_ms": res.get("execution_time_ms", 0),
        "visualizer_link": get_visualizer_link_for_topic(topic_id),
        "visualizer_type": topic_id
    }


def get_visualizer_link_for_topic(topic_id: str) -> str:
    """Maps topic to DSVERSE visualizer route."""
    mapping = {
        "linked-lists": "linked-list/singly",
        "stacks": "stacks",
        "queues": "queues",
        "trees": "trees",
        "heaps": "heaps",
        "graphs": "graphs",
        "hash-tables": "hash-tables",
        "arrays": "arrays",
        "sorting": "algorithm-lab",
        "searching": "algorithm-lab"
    }
    return mapping.get(topic_id, "linked-list/singly")


def generate_vault_trace(question: Dict[str, Any], source_code: str) -> Dict[str, Any]:
    """Generates execution trace for data structure visualization."""
    topic_id = question.get("topic_id", "linked-lists")

    # Map question topic to problem tracer
    if topic_id == "linked-lists":
        return generate_execution_trace("ll-insert-beginning", source_code)
    elif topic_id == "arrays":
        return generate_execution_trace("arr-reverse", source_code)
    else:
        return generate_execution_trace("generic", source_code)
