from fastapi import status
from typing import Any, Dict, Optional

class AppException(Exception):
    """Base exception for application errors."""
    def __init__(
        self, 
        detail: str, 
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        extra: Optional[Dict[str, Any]] = None
    ):
        self.detail = detail
        self.status_code = status_code
        self.extra = extra or {}
        super().__init__(self.detail)

class ValidationError(AppException):
    """Raised when input validation fails."""
    def __init__(self, detail: str, extra: Optional[Dict[str, Any]] = None):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_400_BAD_REQUEST,
            extra=extra
        )

class ServiceError(AppException):
    """Raised when a service operation fails."""
    def __init__(self, detail: str, extra: Optional[Dict[str, Any]] = None):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            extra=extra
        )

class NotFoundError(AppException):
    """Raised when a requested resource is not found."""
    def __init__(self, detail: str, extra: Optional[Dict[str, Any]] = None):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_404_NOT_FOUND,
            extra=extra
        )