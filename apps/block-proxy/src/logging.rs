use serde_json::{Map, Value};
use std::fmt;
use std::time::SystemTime;
use tracing::Level;
use tracing_subscriber::fmt::{FmtContext, FormatEvent, FormatFields};
use tracing_subscriber::registry::LookupSpan;
use tracing_subscriber::{EnvFilter, prelude::*};

/// Visitor that collects tracing event fields into a serde_json Map.
struct JsonVisitor<'a> {
    fields: &'a mut Map<String, Value>,
}

impl<'a> tracing::field::Visit for JsonVisitor<'a> {
    fn record_f64(&mut self, field: &tracing::field::Field, value: f64) {
        self.fields.insert(
            field.name().to_string(),
            Value::Number(
                serde_json::Number::from_f64(value)
                    .unwrap_or(serde_json::Number::from(0i64)),
            ),
        );
    }

    fn record_i64(&mut self, field: &tracing::field::Field, value: i64) {
        self.fields.insert(
            field.name().to_string(),
            Value::Number(serde_json::Number::from(value)),
        );
    }

    fn record_u64(&mut self, field: &tracing::field::Field, value: u64) {
        self.fields.insert(
            field.name().to_string(),
            Value::Number(serde_json::Number::from(value)),
        );
    }

    fn record_bool(&mut self, field: &tracing::field::Field, value: bool) {
        self.fields
            .insert(field.name().to_string(), Value::Bool(value));
    }

    fn record_str(&mut self, field: &tracing::field::Field, value: &str) {
        self.fields.insert(
            field.name().to_string(),
            Value::String(value.to_string()),
        );
    }

    fn record_error(
        &mut self,
        field: &tracing::field::Field,
        value: &(dyn std::error::Error + 'static),
    ) {
        self.fields.insert(
            field.name().to_string(),
            Value::String(value.to_string()),
        );
    }

    fn record_debug(&mut self, field: &tracing::field::Field, value: &dyn fmt::Debug) {
        self.fields.insert(
            field.name().to_string(),
            Value::String(format!("{:?}", value)),
        );
    }
}

/// Pino-compatible JSON formatter.
///
/// Emits one JSON line per event with the shape:
///   `{"level":30,"time":1234567890,"msg":"...","field1":"val1"}`
///
/// Level mapping matches pino conventions:
///   TRACE=10, DEBUG=20, INFO=30, WARN=40, ERROR=50
pub struct PinoFormat;

impl<S, N> FormatEvent<S, N> for PinoFormat
where
    S: tracing::Subscriber + for<'a> LookupSpan<'a>,
    N: for<'a> FormatFields<'a> + 'static,
{
    fn format_event(
        &self,
        _ctx: &FmtContext<'_, S, N>,
        mut writer: tracing_subscriber::fmt::format::Writer<'_>,
        event: &tracing::Event<'_>,
    ) -> fmt::Result {
        let level_num: u8 = match *event.metadata().level() {
            Level::TRACE => 10,
            Level::DEBUG => 20,
            Level::INFO => 30,
            Level::WARN => 40,
            Level::ERROR => 50,
        };

        let time_ms = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0);

        // Collect all event fields into a map.
        let mut fields: Map<String, Value> = Map::new();
        let mut visitor = JsonVisitor {
            fields: &mut fields,
        };
        event.record(&mut visitor);

        // Extract "message" field (tracing uses "message" internally) and map to "msg".
        let msg = fields
            .remove("message")
            .and_then(|v| match v {
                Value::String(s) => Some(s),
                other => Some(other.to_string()),
            })
            .unwrap_or_default();

        // Build the JSON object: start with fixed fields.
        let mut obj: Map<String, Value> = Map::new();
        obj.insert("level".to_string(), Value::Number(serde_json::Number::from(level_num)));
        obj.insert(
            "time".to_string(),
            Value::Number(serde_json::Number::from(time_ms as u64)),
        );
        obj.insert("msg".to_string(), Value::String(msg));

        // Append any additional structured fields from the event.
        for (k, v) in fields {
            obj.insert(k, v);
        }

        let line = serde_json::to_string(&Value::Object(obj))
            .unwrap_or_else(|_| r#"{"level":50,"time":0,"msg":"log serialization error"}"#.to_string());

        writeln!(writer, "{}", line)
    }
}

/// Initialize tracing with the pino-compatible JSON formatter.
///
/// Reads RUST_LOG env var first (if set), otherwise uses `log_level`.
pub fn init_tracing(log_level: &str) {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(log_level));

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::fmt::layer()
                .event_format(PinoFormat)
                .with_filter(filter),
        )
        .init();
}
