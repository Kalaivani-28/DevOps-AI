def parse_logs(logs):
    result=[]
    for line in logs.splitlines():
        line=line.strip()
        if not line: continue
        upper=line.upper()
        level="INFO"
        if "CRITICAL" in upper or "FATAL" in upper:
            level="CRITICAL"
        elif "ERROR" in upper or "EXCEPTION" in upper:
            level="ERROR"
        elif "WARN" in upper:
            level="WARN"
        result.append({"line":line,"level":level})
    return result
