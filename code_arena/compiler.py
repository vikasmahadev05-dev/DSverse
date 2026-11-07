"""
Real C Compiler and Execution Sandbox for DSVERSE Code Arena.
Compiles and executes C11 source using GCC with safety limits, timeout, and diagnostic parsing.
"""

import os
import re
import sys
import time
import shutil
import tempfile
import subprocess
from typing import Dict, Any, List, Optional, Tuple

# On Windows, suppress the system crash/WerFault dialog so segfaults return immediately with error codes
if sys.platform == "win32":
    try:
        import ctypes
        SEM_FAILCRITICALERRORS = 0x0001
        SEM_NOGPFAULTERRORBOX = 0x0002
        ctypes.windll.kernel32.SetErrorMode(SEM_FAILCRITICALERRORS | SEM_NOGPFAULTERRORBOX)
    except Exception:
        pass

GCC_BINARY = "gcc"

DIAGNOSTIC_REGEX = re.compile(
    r'^(?:.*[/\\])?(?P<filename>[^:]+):(?P<line>\d+):(?P<col>\d+):\s+(?P<kind>error|warning|fatal error|note):\s+(?P<msg>.+)$'
)


def check_gcc_available() -> bool:
    try:
        res = subprocess.run([GCC_BINARY, "--version"], capture_output=True, text=True, timeout=2)
        return res.returncode == 0
    except Exception:
        return False


def parse_diagnostics(stderr_text: str) -> List[Dict[str, Any]]:
    diagnostics = []
    for line in stderr_text.splitlines():
        line = line.strip()
        match = DIAGNOSTIC_REGEX.match(line)
        if match:
            diagnostics.append({
                "filename": match.group("filename"),
                "line": int(match.group("line")),
                "column": int(match.group("col")),
                "type": match.group("kind"),
                "message": match.group("msg"),
                "raw": line
            })
    return diagnostics


def compile_and_run_c(
    source_code: str,
    stdin_input: str = "",
    timeout_seconds: float = 2.5,
    compile_only: bool = False,
    extra_flags: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Compiles and executes C source code in an isolated temporary directory.
    Enforces timeout, captures stdout/stderr, and returns structured diagnostics.
    """
    temp_dir = tempfile.mkdtemp(prefix="dsarena_")
    c_source_path = os.path.join(temp_dir, "solution.c")
    exe_path = os.path.join(temp_dir, "solution.exe" if sys.platform == "win32" else "solution")

    try:
        # Write C source code
        with open(c_source_path, "w", encoding="utf-8") as f:
            f.write(source_code)

        # Build GCC command
        cmd = [
            GCC_BINARY,
            "-std=c11",
            "-Wall",
            "-Wextra",
            "-O0",
            "-g",
            "-o", exe_path,
            c_source_path
        ]
        if extra_flags:
            cmd.extend(extra_flags)

        comp_start = time.perf_counter()
        comp_res = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=8.0
        )
        comp_time_ms = round((time.perf_counter() - comp_start) * 1000, 2)

        diagnostics = parse_diagnostics(comp_res.stderr)
        warnings = [d for d in diagnostics if d["type"] == "warning"]
        errors = [d for d in diagnostics if d["type"] in ("error", "fatal error")]

        if comp_res.returncode != 0:
            return {
                "success": False,
                "status": "COMPILATION_ERROR",
                "diagnostics": diagnostics,
                "errors": errors,
                "warnings": warnings,
                "stdout": comp_res.stdout,
                "stderr": comp_res.stderr,
                "compilation_time_ms": comp_time_ms,
                "execution_time_ms": 0.0,
                "exit_code": comp_res.returncode
            }

        if compile_only:
            return {
                "success": True,
                "status": "COMPILED_SUCCESSFULLY",
                "diagnostics": diagnostics,
                "errors": [],
                "warnings": warnings,
                "stdout": "Compilation succeeded with 0 errors.",
                "stderr": comp_res.stderr,
                "compilation_time_ms": comp_time_ms,
                "execution_time_ms": 0.0,
                "exit_code": 0
            }

        # Execution stage
        exec_start = time.perf_counter()
        try:
            run_res = subprocess.run(
                [exe_path],
                input=stdin_input,
                capture_output=True,
                text=True,
                timeout=timeout_seconds
            )
            exec_time_ms = round((time.perf_counter() - exec_start) * 1000, 2)

            is_runtime_error = (run_res.returncode != 0)
            status = "RUNTIME_ERROR" if is_runtime_error else "OK"

            # Check for segmentation fault / crash
            error_note = ""
            if is_runtime_error:
                if run_res.returncode in (-11, 3221225477, 0xC0000005):
                    error_note = "Segmentation Fault (SIGSEGV): Attempted to dereference NULL or unallocated memory address."
                elif run_res.returncode in (-8, 3221225620, 0xC0000094):
                    error_note = "Floating Point Exception (SIGFPE): Division by zero or integer overflow."
                elif run_res.returncode in (-6, 3221225477):
                    error_note = "Aborted (SIGABRT): Program called abort() or assertion failed."
                else:
                    error_note = f"Process terminated abnormally with exit code {run_res.returncode}."

            return {
                "success": not is_runtime_error,
                "status": status,
                "diagnostics": diagnostics,
                "errors": errors,
                "warnings": warnings,
                "stdout": run_res.stdout,
                "stderr": (run_res.stderr + ("\n" + error_note if error_note else "")).strip(),
                "compilation_time_ms": comp_time_ms,
                "execution_time_ms": exec_time_ms,
                "exit_code": run_res.returncode,
                "error_note": error_note
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "status": "TIME_LIMIT_EXCEEDED",
                "diagnostics": diagnostics,
                "errors": errors,
                "warnings": warnings,
                "stdout": "",
                "stderr": f"Execution exceeded maximum permitted time limit ({timeout_seconds}s). Possible infinite loop or recursion.",
                "compilation_time_ms": comp_time_ms,
                "execution_time_ms": round(timeout_seconds * 1000, 2),
                "exit_code": -1,
                "error_note": "Time Limit Exceeded"
            }

    except Exception as ex:
        return {
            "success": False,
            "status": "COMPILATION_ERROR",
            "diagnostics": [],
            "errors": [{"filename": "solution.c", "line": 1, "column": 1, "type": "error", "message": str(ex), "raw": str(ex)}],
            "warnings": [],
            "stdout": "",
            "stderr": f"Internal execution engine error: {str(ex)}",
            "compilation_time_ms": 0.0,
            "execution_time_ms": 0.0,
            "exit_code": -1
        }
    finally:
        # Secure cleanup of temporary workspace
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass
