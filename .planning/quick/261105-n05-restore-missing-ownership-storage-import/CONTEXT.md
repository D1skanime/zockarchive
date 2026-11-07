# Gate 22 context

The extraction of component manual routes left the component media-download
handler in `pc_component_resources.py` without its four storage-access imports.
Gate 22 reported the resulting undefined names through Ruff and mypy. Scope is
limited to restoring those dependencies; no tests are added or run before UAT.
