#!/usr/bin/env python3
"""
Zenodo DOI申请脚本
自动向Zenodo上传文件并获取DOI标识符
"""

import requests
import json
import os
from datetime import datetime

class ZenodoDOI:
    def __init__(self, sandbox=False):
        """
        初始化Zenodo连接
        
        Args:
            sandbox: 是否使用测试环境
        """
        if sandbox:
            self.base_url = "https://sandbox.zenodo.org"
            print("使用 Zenodo 测试环境")
        else:
            self.base_url = "https://zenodo.org"
            print("使用 Zenodo 正式环境")
        
        # 从环境变量获取API令牌
        self.token = os.environ.get("ZENODO_TOKEN")
        if not self.token:
            raise ValueError("请设置 ZENODO_TOKEN 环境变量")
        
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
    
    def create_deposition(self, metadata):
        """
        创建新的deposition
        
        Args:
            metadata: 文档元数据
        
        Returns:
            deposition_id
        """
        url = f"{self.base_url}/api/deposit/depositions"
        
        # 创建空的deposition
        response = requests.post(url, json={}, headers=self.headers)
        response.raise_for_status()
        
        deposition_id = response.json()["id"]
        print(f"创建 deposition: {deposition_id}")
        
        # 更新元数据
        update_url = f"{url}/{deposition_id}"
        update_data = {"metadata": metadata}
        update_response = requests.put(update_url, json=update_data, headers=self.headers)
        update_response.raise_for_status()
        
        return deposition_id
    
    def upload_file(self, deposition_id, file_path):
        """
        上传文件到deposition
        
        Args:
            deposition_id: deposition ID
            file_path: 文件路径
        
        Returns:
            文件信息
        """
        url = f"{self.base_url}/api/deposit/depositions/{deposition_id}/files"
        
        with open(file_path, 'rb') as file:
            files = {'file': file}
            response = requests.post(url, files=files, headers={
                "Authorization": f"Bearer {self.token}"
            })
        
        response.raise_for_status()
        print(f"上传文件: {os.path.basename(file_path)}")
        return response.json()
    
    def publish(self, deposition_id):
        """
        发布deposition并获取DOI
        
        Args:
            deposition_id: deposition ID
        
        Returns:
            DOI信息
        """
        url = f"{self.base_url}/api/deposit/depositions/{deposition_id}/actions/publish"
        response = requests.post(url, headers=self.headers)
        response.raise_for_status()
        
        result = response.json()
        doi = result.get("doi")
        doi_url = result.get("links", {}).get("doi")
        
        print(f"发布成功！")
        print(f"DOI: {doi}")
        print(f"DOI URL: {doi_url}")
        
        return {
            "doi": doi,
            "doi_url": doi_url,
            "record_id": result.get("id"),
            "created": result.get("created"),
            "metadata": result.get("metadata")
        }
    
    def upload_and_publish(self, metadata, file_paths):
        """
        完整的上传和发布流程
        
        Args:
            metadata: 文档元数据
            file_paths: 文件路径列表
        
        Returns:
            DOI信息
        """
        print("开始DOI申请流程...")
        
        # 1. 创建deposition
        deposition_id = self.create_deposition(metadata)
        
        # 2. 上传所有文件
        for file_path in file_paths:
            if os.path.exists(file_path):
                self.upload_file(deposition_id, file_path)
            else:
                print(f"警告: 文件不存在 {file_path}")
        
        # 3. 发布并获取DOI
        result = self.publish(deposition_id)
        
        return result

# 使用示例
if __name__ == "__main__":
    # 配置元数据
    metadata = {
        "title": "几何弦统一理论及其应用体系",
        "creators": [
            {
                "name": "袁知春",
                "affiliation": "独立研究者"
            }
        ],
        "description": """
            几何弦统一理论是一个从几何第一性原理出发的统一理论框架。
            该理论自然地推导出九维空间结构，并从几何关系中涌现出所有
