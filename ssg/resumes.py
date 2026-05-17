from pathlib import Path
from ssg.models import ResumeConfig
import json

RESUMES_PATH = Path(__file__).resolve().parent.parent / "public/static/resumes"

def get_static_resume_path(path_segment:str) -> str:
    return f"/static/resumes/{path_segment.removeprefix('/')}"

def generate_resumes():
    resumes_config_dict = {}
    for resume_path in RESUMES_PATH.iterdir():
        if resume_path.is_file():
            continue
        # Validate the config
        raw_config = (resume_path / "config.json").read_text()
        config = ResumeConfig.model_validate_json(raw_config)

        config.path = get_static_resume_path(f"{resume_path.name}/{config.path}")

        resumes_config_dict[get_static_resume_path(resume_path.name)] = config.model_dump()

    out_file = RESUMES_PATH / "resumes.json"
    out_file.write_text(json.dumps(resumes_config_dict))
    print(f"Wrote resumes config to '{out_file}'.")