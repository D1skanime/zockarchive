---
quick_id: 261116-regression01
status: complete
---

# Summary

The extracted streaming helper retains select/os.read for real extractor file
descriptors. Existing process doubles use their bounded scripted reader path.
The 7z wrapper again owns termination and reaping, preserving its historical
contract. The mixed-scan test now constructs a real mapped command.
