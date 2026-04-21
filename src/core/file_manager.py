import os


class FileManager:
    @staticmethod
    def ensure_output_dir(path: str) -> None:
        os.makedirs(path, exist_ok=True)