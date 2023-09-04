extern crate neon_serde3;
extern crate serde_json;

use neon::prelude::*;

fn parse(mut cx: FunctionContext) -> JsResult<JsValue> {
  let string = cx.argument::<JsString>(0)?;
  let mut object: serde_json::Value = serde_json::from_str(&string.value(&mut cx)).unwrap_or_default();

  escape_json(&mut object);

  let value = neon_serde3::to_value(&mut cx, &object)
    .or_else(|e| cx.throw_error(e.to_string()))
    .unwrap();

  Ok(value)
}

fn stringify(mut cx: FunctionContext) -> JsResult<JsString> {
  let value = cx.argument::<JsValue>(0)?;
  let mut object: serde_json::Value = neon_serde3::from_value(&mut cx, value)
    .or_else(|e| cx.throw_error(e.to_string()))
    .unwrap();

  escape_json(&mut object);

  let string = serde_json::to_string(&object).unwrap_or_default();

  Ok(cx.string(string))
}

fn escape_json(object: &mut serde_json::Value) {
  match object {
    serde_json::Value::Object(ref mut value) => {
      for (_key, val) in value {
        escape_json(val);
      }
    }
    serde_json::Value::Array(ref mut values) => {
      for element in values.iter_mut() {
        escape_json(element)
      }
    }
    serde_json::Value::String(ref mut value) => *value = value.escape_default().to_string(),
    _ => {}
  }
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
  cx.export_function("parse", parse)?;
  cx.export_function("stringify", stringify)?;
  Ok(())
}
