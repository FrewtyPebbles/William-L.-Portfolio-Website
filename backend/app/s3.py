import pathlib
import boto3
from botocore.exceptions import ClientError
from .settings import settings

_IS_DEV = not settings.S3_BUCKET_NAME
_UPLOADS_DIR = pathlib.Path(__file__).resolve().parent.parent.parent / "public" / "static" / "uploads"

if not _IS_DEV:
    s3_client = boto3.client("s3", region_name=settings.S3_REGION)


def get_asset_s3_url(file_name: str) -> str:
    return f"static/uploads/{file_name}"


def s3_upload_file(file_name: str, content: bytes) -> bool:
    if _IS_DEV:
        _UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        (_UPLOADS_DIR / pathlib.Path(file_name).name).write_bytes(content)
        return True
    try:
        s3_client.put_object(Bucket=settings.S3_BUCKET_NAME, Key=file_name, Body=content)
        return True
    except ClientError as err:
        print(f"AWS S3 s3_upload_file error: {err}")
        return False


def s3_delete_file(file_name: str) -> bool:
    if _IS_DEV:
        target = _UPLOADS_DIR / pathlib.Path(file_name).name
        if target.exists():
            target.unlink()
        return True
    try:
        s3_client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=file_name)
        return True
    except ClientError as err:
        print(f"AWS S3 s3_delete_file error: {err}")
        return False
