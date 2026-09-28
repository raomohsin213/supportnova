"""JSON Schema Validator for GenAI Outputs."""
import json
from pathlib import Path
from typing import Dict, Any, Tuple

try:
    import jsonschema
except ImportError:
    jsonschema = None

SCHEMA_PATH = Path(__file__).resolve().parent / "genai_output_schema.json"

def load_schema() -> Dict[str, Any]:
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def validate_genai_output(data: Dict[str, Any]) -> Tuple[bool, str]:
    schema = load_schema()
    if jsonschema is not None:
        try:
            jsonschema.validate(instance=data, schema=schema)
            return True, "Schema validation successful"
        except jsonschema.ValidationError as err:
            return False, f"Schema validation error: {err.message}"
        except Exception as e:
            return False, f"Validation error: {str(e)}"
    
    # Fallback required keys validator if jsonschema library is not installed
    required = schema.get("required", [])
    for field in required:
        if field not in data:
            return False, f"Missing required schema field '{field}'"
    return True, "Schema fields validated successfully (fallback validator)"
