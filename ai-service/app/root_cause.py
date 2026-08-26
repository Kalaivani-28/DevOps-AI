def detect_root_cause(events, metrics, deployment):
    text=" ".join(e["line"].lower() for e in events)
    factors=[]
    actions=[]
    if "connection pool" in text or metrics.get("dbConnections") == 100:
        cause="Database connection pool exhaustion"
        factors=["High request volume","Increased database latency","Connection pool reached maximum"]
        actions=["Check database connection pool","Check database CPU and connection count","Compare traffic with previous hour","Review recent deployment","Consider scaling the service"]
        return {"rootCause":cause,"severity":"CRITICAL","confidence":91,"contributingFactors":factors,"recommendedActions":actions}
    if "timeout" in text:
        return {"rootCause":"Possible service timeout or network latency","severity":"HIGH","confidence":84,
                "contributingFactors":["Slow downstream response","Possible network latency"],
                "recommendedActions":["Check downstream service health","Review response-time metrics","Inspect recent deployments"]}
    if "connection refused" in text:
        return {"rootCause":"Downstream service or database is unavailable","severity":"HIGH","confidence":88,
                "contributingFactors":["Connection refusal","Possible service outage"],
                "recommendedActions":["Check dependency health","Check database/service availability","Review deployment events"]}
    if "outofmemory" in text or "out of memory" in text:
        return {"rootCause":"Application memory exhaustion","severity":"CRITICAL","confidence":93,
                "contributingFactors":["Memory pressure","Possible memory leak"],
                "recommendedActions":["Inspect heap usage","Check recent code changes","Increase capacity after investigation"]}
    if any(e["level"]=="ERROR" for e in events):
        return {"rootCause":"Application error detected; inspect related stack trace","severity":"MEDIUM","confidence":72,
                "contributingFactors":["Application exception or failure"],
                "recommendedActions":["Inspect stack trace","Correlate with metrics","Review recent deployment"]}
    return {"rootCause":"No obvious root cause detected from supplied data","severity":"LOW","confidence":45,
            "contributingFactors":[],"recommendedActions":["Collect more logs and metrics","Check service dependencies"]}
