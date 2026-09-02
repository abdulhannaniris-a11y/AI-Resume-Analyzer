"""
Import all SQLAlchemy models here so that `Base.metadata.create_all()`
(called from app/main.py on startup) knows about every table.

Whenever a new model is added under app/models/, import it here too.
"""

from app.db.session import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.resume import Resume  # noqa: F401
from app.models.job_description import JobDescription  # noqa: F401
from app.models.analysis import Analysis  # noqa: F401
