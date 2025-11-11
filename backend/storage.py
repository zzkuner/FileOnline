import os
import boto3
from botocore.exceptions import ClientError
from minio import Minio
from minio.error import S3Error

class StorageService:
    def __init__(self):
        self.storage_type = os.getenv("STORAGE_TYPE", "minio")  # minio or s3
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "fileonline")
        
        if self.storage_type == "minio":
            self.client = Minio(
                os.getenv("S3_ENDPOINT", "localhost:9000").replace('http://', '').replace('https://', ''),
                access_key=os.getenv("S3_ACCESS_KEY", "minioadmin"),
                secret_key=os.getenv("S3_SECRET_KEY", "minioadmin123"),
                secure=os.getenv("S3_ENDPOINT", "localhost:9000").startswith('https://')
            )
        else:
            self.client = boto3.client(
                's3',
                endpoint_url=os.getenv("S3_ENDPOINT"),
                aws_access_key_id=os.getenv("S3_ACCESS_KEY"),
                aws_secret_access_key=os.getenv("S3_SECRET_KEY")
            )
    
    def upload_file(self, file_path, object_name):
        """上传文件到存储服务"""
        try:
            if self.storage_type == "minio":
                result = self.client.fput_object(
                    self.bucket_name, object_name, file_path
                )
                return result
            else:
                with open(file_path, 'rb') as file:
                    self.client.upload_fileobj(file, self.bucket_name, object_name)
                return True
        except S3Error as e:
            print(f"MinIO错误: {e}")
            return False
        except ClientError as e:
            print(f"AWS S3错误: {e}")
            return False
    
    def download_file(self, object_name, file_path):
        """从存储服务下载文件"""
        try:
            if self.storage_type == "minio":
                self.client.fget_object(self.bucket_name, object_name, file_path)
                return True
            else:
                self.client.download_file(self.bucket_name, object_name, file_path)
                return True
        except S3Error as e:
            print(f"MinIO错误: {e}")
            return False
        except ClientError as e:
            print(f"AWS S3错误: {e}")
            return False
    
    def generate_presigned_url(self, object_name, expiration=3600):
        """生成预签名URL用于访问文件"""
        try:
            if self.storage_type == "minio":
                url = self.client.presigned_get_object(
                    self.bucket_name, object_name, expires=expiration
                )
                return url
            else:
                url = self.client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket_name, 'Key': object_name},
                    ExpiresIn=expiration
                )
                return url
        except S3Error as e:
            print(f"MinIO错误: {e}")
            return None
        except ClientError as e:
            print(f"AWS S3错误: {e}")
            return None
    
    def delete_file(self, object_name):
        """从存储服务删除文件"""
        try:
            if self.storage_type == "minio":
                self.client.remove_object(self.bucket_name, object_name)
                return True
            else:
                self.client.delete_object(Bucket=self.bucket_name, Key=object_name)
                return True
        except S3Error as e:
            print(f"MinIO错误: {e}")
            return False
        except ClientError as e:
            print(f"AWS S3错误: {e}")
            return False

# 创建全局存储服务实例
storage_service = StorageService()