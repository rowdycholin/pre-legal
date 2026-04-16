"""Pytest configuration — mock platform-native libs unavailable on Windows."""
import sys
from types import ModuleType
from unittest.mock import MagicMock

# WeasyPrint requires GTK/Pango native libs that aren't available on Windows.
# Stub it out so tests can import the app without native library errors.
if "weasyprint" not in sys.modules:
    wp = ModuleType("weasyprint")
    wp.HTML = MagicMock()
    sys.modules["weasyprint"] = wp
