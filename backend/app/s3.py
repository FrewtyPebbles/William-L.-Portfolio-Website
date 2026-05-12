import os
import boto3
from botocore.exceptions import ClientError

S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME", "")
S3_REGION = os.environ.get("S3_REGION", "us-west-1")

s3_client = boto3.client("s3", region_name=S3_REGION)


def get_asset_s3_url(file_name: str) -> str:
    return f"static/uploads/{file_name}"


def s3_upload_file(file_name: str, content: bytes) -> bool:
    try:
        s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=file_name, Body=content)
        return True
    except ClientError as err:
        print(f"AWS S3 s3_upload_file error: {err}")
        return False


def s3_delete_file(file_name: str) -> bool:
    try:
        s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=file_name)
        return True
    except ClientError as err:
        print(f"AWS S3 s3_delete_file error: {err}")
        return False
