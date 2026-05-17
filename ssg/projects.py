from pathlib import Path
from ssg.models import ProjectConfig
import json

PROJECTS_PATH = Path(__file__).resolve().parent.parent / "public/static/projects"

def get_static_project_path(path_segment:str) -> str:
    return f"/static/projects/{path_segment.removeprefix('/')}"

def generate_projects():
    projects_config_dict = {}
    for project_path in PROJECTS_PATH.iterdir():
        if project_path.is_file():
            continue
        # Validate the config
        raw_config = (project_path / "config.json").read_text()
        config = ProjectConfig.model_validate_json(raw_config)

        # augment the config paths into url paths
        for image in config.images:
            image.path = get_static_project_path(f"{project_path.name}/{image.path}")

        projects_config_dict[get_static_project_path(project_path.name)] = config.model_dump()

    out_file = PROJECTS_PATH / "projects.json"
    out_file.write_text(json.dumps(projects_config_dict))
    print(f"Wrote projects config to '{out_file}'.")