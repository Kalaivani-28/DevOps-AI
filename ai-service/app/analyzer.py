from .log_parser import parse_logs
from .root_cause import detect_root_cause

def analyze_incident(logs, metrics=None, service="Unknown Service", deployment=""):
    metrics = metrics or {}
    events = parse_logs(logs)
    analysis = detect_root_cause(events, metrics, deployment)
    return {
        "service": service,
        "summary": f"Detected {len(events)} log event(s) for {service}.",
        "severity": analysis["severity"],
        "rootCause": analysis["rootCause"],
        "contributingFactors": analysis["contributingFactors"],
        "confidence": analysis["confidence"],
        "recommendedActions": analysis["recommendedActions"],
        "events": events
    }
