"""
Automated Judge Engine for DSVERSE Code Arena.
Evaluates C code against visible and hidden test suites, parses test results,
enforces execution limits, identifies pointer/invariant errors, and records verdicts.
"""

import json
import re
from typing import Dict, Any, List, Optional
from code_arena.compiler import compile_and_run_c
from code_arena.problems import get_problem_by_id
from code_arena.harness import generate_c_harness
from code_arena.tracer import generate_execution_trace
from code_arena.db import save_submission, save_user_solution


def _parse_harness_test_results(stdout_text: str) -> List[Dict[str, Any]]:
    """Extracts JSON test objects emitted by C harness between markers."""
    results = []
    in_results_block = False
    for line in stdout_text.splitlines():
        line = line.strip()
        if line == "__ARENA_TEST_RESULTS_START__":
            in_results_block = True
            continue
        elif line == "__ARENA_TEST_RESULTS_END__":
            in_results_block = False
            break
        if in_results_block and line.startswith("{") and line.endswith("}"):
            try:
                results.append(json.loads(line))
            except Exception:
                pass
    return results


def run_problem_code(problem_id: str, code: str, mode: str = "function") -> Dict[str, Any]:
    """
    Executes visible test cases for rapid debugging and preview.
    """
    problem = get_problem_by_id(problem_id)
    if not problem:
        return {"success": False, "verdict": "ERROR", "message": f"Problem '{problem_id}' not found."}

    visible_tests = problem.get("visible_tests", [])

    if mode == "full_program":
        # Full program mode: compiles directly and runs with first test input
        stdin_str = str(visible_tests[0].get("initial", "")) if visible_tests else ""
        comp_res = compile_and_run_c(code, stdin_input=stdin_str)
        return {
            "success": comp_res["success"],
            "verdict": comp_res["status"],
            "mode": "full_program",
            "stdout": comp_res["stdout"],
            "stderr": comp_res["stderr"],
            "diagnostics": comp_res["diagnostics"],
            "errors": comp_res["errors"],
            "warnings": comp_res["warnings"],
            "execution_time_ms": comp_res["execution_time_ms"],
            "compilation_time_ms": comp_res["compilation_time_ms"],
            "tests": []
        }

    # Function implementation mode
    harness_c = generate_c_harness(problem, code, visible_tests)
    comp_res = compile_and_run_c(harness_c, timeout_seconds=3.0)

    if not comp_res["success"]:
        return {
            "success": False,
            "verdict": comp_res["status"],
            "mode": "function",
            "stdout": comp_res["stdout"],
            "stderr": comp_res["stderr"],
            "diagnostics": comp_res["diagnostics"],
            "errors": comp_res["errors"],
            "warnings": comp_res["warnings"],
            "execution_time_ms": comp_res["execution_time_ms"],
            "compilation_time_ms": comp_res["compilation_time_ms"],
            "tests": []
        }

    parsed_tests = _parse_harness_test_results(comp_res["stdout"])
    all_passed = True
    for t in parsed_tests:
        if t.get("status") != "PASSED":
            all_passed = False
            break

    verdict = "ACCEPTED" if all_passed and len(parsed_tests) == len(visible_tests) else "WRONG_ANSWER"

    return {
        "success": all_passed,
        "verdict": verdict,
        "mode": "function",
        "stdout": comp_res["stdout"],
        "stderr": comp_res["stderr"],
        "diagnostics": comp_res["diagnostics"],
        "errors": comp_res["errors"],
        "warnings": comp_res["warnings"],
        "execution_time_ms": comp_res["execution_time_ms"],
        "compilation_time_ms": comp_res["compilation_time_ms"],
        "tests": parsed_tests,
        "passed_count": sum(1 for t in parsed_tests if t.get("status") == "PASSED"),
        "total_count": len(visible_tests)
    }


def submit_problem_code(problem_id: str, code: str, username: str = "scholar") -> Dict[str, Any]:
    """
    Submits code for comprehensive evaluation across visible and hidden test suites.
    Records submission in the database.
    """
    problem = get_problem_by_id(problem_id)
    if not problem:
        return {"success": False, "verdict": "ERROR", "message": f"Problem '{problem_id}' not found."}

    all_tests = problem.get("visible_tests", []) + problem.get("hidden_tests", [])
    harness_c = generate_c_harness(problem, code, all_tests)
    comp_res = compile_and_run_c(harness_c, timeout_seconds=4.0)

    if not comp_res["success"]:
        verdict = comp_res["status"]
        save_submission(
            username=username,
            problem_id=problem_id,
            source_code=code,
            verdict=verdict,
            passed_tests=0,
            total_tests=len(all_tests),
            execution_time_ms=comp_res["compilation_time_ms"]
        )
        return {
            "success": False,
            "verdict": verdict,
            "stdout": comp_res["stdout"],
            "stderr": comp_res["stderr"],
            "diagnostics": comp_res["diagnostics"],
            "errors": comp_res["errors"],
            "warnings": comp_res["warnings"],
            "execution_time_ms": comp_res["execution_time_ms"],
            "compilation_time_ms": comp_res["compilation_time_ms"],
            "tests": [],
            "passed_count": 0,
            "total_count": len(all_tests)
        }

    parsed_tests = _parse_harness_test_results(comp_res["stdout"])
    passed_count = sum(1 for t in parsed_tests if t.get("status") == "PASSED")
    total_count = len(all_tests)

    verdict = "ACCEPTED" if passed_count == total_count else "WRONG_ANSWER"

    # Filter out hidden test details to keep secret test inputs confidential
    client_tests = []
    visible_count = len(problem.get("visible_tests", []))
    for idx, t in enumerate(parsed_tests):
        if idx < visible_count:
            client_tests.append(t)
        else:
            client_tests.append({
                "test_idx": t["test_idx"],
                "status": t["status"],
                "label": f"Hidden Test Case {idx - visible_count + 1}",
                "actual": t["actual"] if t["status"] == "PASSED" else "[Confidential Hidden Output]",
                "expected": "[Confidential Hidden Test]"
            })

    # Save to database
    sub_id = save_submission(
        username=username,
        problem_id=problem_id,
        source_code=code,
        verdict=verdict,
        passed_tests=passed_count,
        total_tests=total_count,
        execution_time_ms=comp_res["execution_time_ms"]
    )
    save_user_solution(username=username, problem_id=problem_id, source_code=code)

    return {
        "submission_id": sub_id,
        "success": (verdict == "ACCEPTED"),
        "verdict": verdict,
        "tests": client_tests,
        "passed_count": passed_count,
        "total_count": total_count,
        "execution_time_ms": comp_res["execution_time_ms"],
        "compilation_time_ms": comp_res["compilation_time_ms"],
        "diagnostics": comp_res["diagnostics"],
        "errors": comp_res["errors"],
        "warnings": comp_res["warnings"]
    }


def compile_c_code_only(code: str) -> Dict[str, Any]:
    """Compiles code for syntax checking and diagnostic inspection without execution."""
    return compile_and_run_c(code, compile_only=True)


def get_visual_debug_trace(problem_id: str, code: str) -> Dict[str, Any]:
    """Generates execution trace and synchronized variable/memory states for the visualizer."""
    return generate_execution_trace(problem_id, code)

